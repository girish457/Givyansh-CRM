import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  User, 
  ChevronRight, 
  Plus, 
  Check, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  MessageSquare,
  Users,
  ShieldCheck,
  TrendingUp,
  LucideCalendar,
  LucideUsers,
  LucideBriefcase,
  LucideUserCheck,
  LucideClock
} from "lucide-react";

interface CandidateRevertsProps {
  candidates: any[];
  currentUser: any;
  onRefresh: () => void;
  role: "recruiter" | "tl" | "manager" | "boss";
}

export default function CandidateReverts({ candidates = [], currentUser, onRefresh, role }: CandidateRevertsProps) {
  const [queries, setQueries] = useState<any[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeClients, setActiveClients] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  
  // Advanced Filters
  const [filterName, setFilterName] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterJob, setFilterJob] = useState("");
  const [filterRecruiter, setFilterRecruiter] = useState("");
  const [filterTL, setFilterTL] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterQueryStatus, setFilterQueryStatus] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("all"); // all, today, 7days, 30days, custom
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Modals / Actions
  const [showAskRevertModal, setShowAskRevertModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [askRevertReason, setAskRevertReason] = useState("");

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [activeQuery, setActiveQuery] = useState<any>(null);
  const [resolutionStatus, setResolutionStatus] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  
  // Schedule Later states
  const [scheduleType, setScheduleType] = useState<"today" | "tomorrow" | "custom">("today");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDate, setScheduleDate] = useState("");

  // Direct edit status states
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null);
  const [showDirectScheduleModal, setShowDirectScheduleModal] = useState(false);
  const [directScheduleCandidate, setDirectScheduleCandidate] = useState<any>(null);
  const [directScheduleStatus, setDirectScheduleStatus] = useState("");
  const [directResolutionNote, setDirectResolutionNote] = useState("");

  // Interview Done round picker states
  const [showInterviewDoneModal, setShowInterviewDoneModal] = useState(false);
  const [interviewDoneCandidate, setInterviewDoneCandidate] = useState<any>(null);
  const [interviewDoneRounds, setInterviewDoneRounds] = useState(1);
  const [resolutionRoundStatus, setResolutionRoundStatus] = useState("Round 1 Done");

  // Tabs for query separation
  const [activeTab, setActiveTab] = useState<"pending" | "resolved" | "tracker" | "timeline">("pending");
  const [selectedProfileCandidate, setSelectedProfileCandidate] = useState<any>(null);

  useEffect(() => {
    fetchQueries();
    fetchActiveClientsAndJobs();
  }, [role, currentUser]);

  const fetchActiveClientsAndJobs = async () => {
    try {
      const [clientsRes, jobsRes] = await Promise.all([
        fetch("/api/clients").then(r => r.ok ? r.json() : []),
        fetch("/api/jobs").then(r => r.ok ? r.json() : [])
      ]);
      setActiveClients(clientsRes);
      setActiveJobs(jobsRes);
    } catch (err) {
      console.error("Failed to fetch active filter data", err);
    }
  };

  const fetchQueries = async () => {
    setLoadingQueries(true);
    try {
      const res = await fetch("/api/revert-queries");
      if (res.ok) {
        const data = await res.json();
        setQueries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch revert queries", err);
    } finally {
      setLoadingQueries(false);
    }
  };

  // Trigger ask revert
  const handleAskRevertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      const res = await fetch("/api/revert-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidate.id || selectedCandidate._id,
          queryReason: askRevertReason
        })
      });

      if (res.ok) {
        setShowAskRevertModal(false);
        setAskRevertReason("");
        setSelectedCandidate(null);
        fetchQueries();
        onRefresh();
        alert("Ask Revert request created and routed to superiors successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create ask revert request.");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling backend server.");
    }
  };

  // Trigger query resolve
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuery || !resolutionStatus) return;

    let finalInterviewDate = null;
    let finalInterviewTime = null;

    if (resolutionStatus === "Schedule Later") {
      const today = new Date();
      if (scheduleType === "today") {
        finalInterviewDate = today.toISOString().split("T")[0];
        finalInterviewTime = scheduleTime;
      } else if (scheduleType === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        finalInterviewDate = tomorrow.toISOString().split("T")[0];
        finalInterviewTime = scheduleTime;
      } else {
        if (!scheduleDate) {
          alert("Please pick a custom date.");
          return;
        }
        finalInterviewDate = scheduleDate;
        finalInterviewTime = scheduleTime;
      }
    }

    const resolvedCand = activeQuery ? candidates.find(c => String(c.id || c._id) === String(activeQuery.candidateId)) : null;
    const resolvedCandJob = resolvedCand ? activeJobs.find(job => 
      (job.title?.toLowerCase() === resolvedCand.designation?.toLowerCase() || job.title?.toLowerCase() === resolvedCand.jobRole?.toLowerCase()) &&
      (job.client?.name?.toLowerCase() === resolvedCand.clientName?.toLowerCase())
    ) || activeJobs.find(job => 
      (job.title?.toLowerCase() === resolvedCand.designation?.toLowerCase() || job.title?.toLowerCase() === resolvedCand.jobRole?.toLowerCase())
    ) : null;

    const finalStatus = (resolutionStatus === "Interview Done" && resolvedCandJob && resolvedCandJob.interviewRounds > 1)
      ? resolutionRoundStatus
      : resolutionStatus;

    try {
      const res = await fetch(`/api/revert-queries/${activeQuery.id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: finalStatus,
          resolutionNote,
          interviewDate: finalInterviewDate,
          interviewTime: finalInterviewTime
        })
      });

      if (res.ok) {
        setShowResolveModal(false);
        setActiveQuery(null);
        setResolutionStatus("");
        setResolutionNote("");
        fetchQueries();
        onRefresh();
        window.dispatchEvent(new Event("REFRESH_GAMIFICATION"));
        alert("Query resolved and status synchronized globally!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to resolve query.");
      }
    } catch (err) {
      console.error(err);
      alert("Error communicating with server.");
    }
  };

  // Helper to generate status options
  const getStatusOptions = (c: any) => {
    const list = [
      "Not Interested",
      "Selected",
      "Rejected",
      "Go For Interview",
      "Joined",
      "Dropped",
      "Process To Joining",
      "Schedule Later",
      "Interview Done",
      "Interview Not Done",
      "Processing For Next Round"
    ];
    if (c?.remarks && !list.includes(c.remarks)) {
      list.push(c.remarks);
    }
    return list;
  };

  // Directly change candidate status (TL, Manager, Boss only)
  const handleDirectStatusChange = async (c: any, newStatus: string) => {
    const cid = c.id || c._id;

    // Find job associated with the candidate
    const candidateJob = activeJobs.find(job => 
      (job.title?.toLowerCase() === c.designation?.toLowerCase() || job.title?.toLowerCase() === c.jobRole?.toLowerCase()) &&
      (job.client?.name?.toLowerCase() === c.clientName?.toLowerCase())
    ) || activeJobs.find(job => 
      (job.title?.toLowerCase() === c.designation?.toLowerCase() || job.title?.toLowerCase() === c.jobRole?.toLowerCase())
    );

    if (newStatus === "Interview Done" && candidateJob && candidateJob.interviewRounds > 1) {
      setInterviewDoneCandidate(c);
      setInterviewDoneRounds(candidateJob.interviewRounds);
      setShowInterviewDoneModal(true);
      return;
    }

    if (newStatus === "Schedule Later") {
      setDirectScheduleCandidate(c);
      setDirectScheduleStatus(newStatus);
      setScheduleTime("09:00");
      setScheduleType("today");
      setScheduleDate("");
      setDirectResolutionNote("");
      setShowDirectScheduleModal(true);
      return;
    }

    if (!confirm(`Are you sure you want to directly update ${c.name}'s status to: ${newStatus}?`)) {
      return;
    }

    setUpdatingCandidateId(String(cid));
    try {
      const res = await fetch(`/api/candidates/${cid}/direct-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus,
          resolutionNote: `Direct status override to ${newStatus} by ${role.toUpperCase()}`
        })
      });

      if (res.ok) {
        alert("Status updated directly and timeline audit log created successfully!");
        fetchQueries();
        onRefresh();
        window.dispatchEvent(new Event("REFRESH_GAMIFICATION"));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error communicating with server.");
    } finally {
      setUpdatingCandidateId(null);
    }
  };

  // Submit direct schedule later modal
  const handleDirectScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directScheduleCandidate || !directScheduleStatus) return;

    let finalInterviewDate = null;
    let finalInterviewTime = null;

    const today = new Date();
    if (scheduleType === "today") {
      finalInterviewDate = today.toISOString().split("T")[0];
      finalInterviewTime = scheduleTime;
    } else if (scheduleType === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      finalInterviewDate = tomorrow.toISOString().split("T")[0];
      finalInterviewTime = scheduleTime;
    } else {
      if (!scheduleDate) {
        alert("Please pick a custom date.");
        return;
      }
      finalInterviewDate = scheduleDate;
      finalInterviewTime = scheduleTime;
    }

    const cid = directScheduleCandidate.id || directScheduleCandidate._id;
    setUpdatingCandidateId(String(cid));
    setShowDirectScheduleModal(false);

    try {
      const res = await fetch(`/api/candidates/${cid}/direct-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: directScheduleStatus,
          resolutionNote: directResolutionNote || `Scheduled interview directly by ${role.toUpperCase()}`,
          interviewDate: finalInterviewDate,
          interviewTime: finalInterviewTime
        })
      });

      if (res.ok) {
        alert("Status updated directly and interview scheduled successfully!");
        fetchQueries();
        onRefresh();
        window.dispatchEvent(new Event("REFRESH_GAMIFICATION"));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error communicating with server.");
    } finally {
      setUpdatingCandidateId(null);
      setDirectScheduleCandidate(null);
      setDirectScheduleStatus("");
      setDirectResolutionNote("");
    }
  };

  // Submit direct interview done rounds picker modal
  const handleDirectInterviewDoneSelect = async (c: any, selectedRoundStatus: string) => {
    const cid = c.id || c._id;
    setShowInterviewDoneModal(false);
    setUpdatingCandidateId(String(cid));
    
    try {
      const res = await fetch(`/api/candidates/${cid}/direct-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: selectedRoundStatus,
          resolutionNote: `Interview done update to ${selectedRoundStatus} by ${role.toUpperCase()}`
        })
      });

      if (res.ok) {
        alert("Status updated directly and audit log entry created successfully!");
        fetchQueries();
        onRefresh();
        window.dispatchEvent(new Event("REFRESH_GAMIFICATION"));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error communicating with server.");
    } finally {
      setUpdatingCandidateId(null);
      setInterviewDoneCandidate(null);
    }
  };

  // Allowed statuses to show in this tab
  const ALLOWED_STATUSES = [
    "Interested",
    "Go For Interview",
    "Rejected",
    "Selected",
    "Process To Joining",
    "Revert Later",
    "Joined",
    "Interview Done",
    "Interview Not Done",
    "Round 1 Done",
    "Round 2 Done",
    "Round 3 Done",
    "Round 4 Done",
    "Round 5 Done",
    "All Round Done",
    "All Rounds Done",
    "Processing For Next Round",
    "Interview Rescheduled"
  ];

  // Extract unique filter lists from active/real master lists to avoid showing deleted/historical values
  const uniqueClients = Array.from(new Set(activeClients.map(c => c.name).filter(Boolean))).sort() as string[];
  const uniqueJobs = Array.from(new Set(activeJobs.map(j => j.title).filter(Boolean))).sort() as string[];
  const uniqueRecruiters = Array.from(new Set(candidates.map(c => c.recruiterName).filter(Boolean))).sort() as string[];

  // Candidates meeting criteria (Show all candidates in the tracker pool)
  const matchingCandidates = candidates;

  // Global search & Advanced filters for queries AND candidates
  const filteredCandidates = matchingCandidates.filter(c => {
    const candName = c.name || "";
    const phone = c.phone || "";
    const client = c.clientName || "";
    const job = c.designation || c.jobRole || "";
    const status = c.remarks || "";
    const recName = c.recruiterName || "";

    // Global real-time search match
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      const match = candName.toLowerCase().includes(queryLower) ||
                    phone.toLowerCase().includes(queryLower) ||
                    client.toLowerCase().includes(queryLower) ||
                    job.toLowerCase().includes(queryLower) ||
                    recName.toLowerCase().includes(queryLower);
      if (!match) return false;
    }

    // Advanced Filters
    if (filterName && !candName.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterPhone && !phone.toLowerCase().includes(filterPhone.toLowerCase())) return false;
    if (filterClient && !client.toLowerCase().includes(filterClient.toLowerCase())) return false;
    if (filterJob && !job.toLowerCase().includes(filterJob.toLowerCase())) return false;
    if (filterRecruiter && !recName.toLowerCase().includes(filterRecruiter.toLowerCase())) return false;
    if (filterStatus && status.toLowerCase() !== filterStatus.toLowerCase()) return false;

    return true;
  });

  // Filter queries
  const filteredQueries = queries.filter(q => {
    const candName = q.candidateName || "";
    const phone = q.candidateNumber || "";
    const client = q.clientName || "";
    const job = q.jobTitle || "";
    const recName = q.recruiterName || "";
    const tlName = q.tlName || "";
    const qStatus = q.status || "";

    // Hierarchy check
    if (role === "tl") {
      // TL can only see recruiters under them, or queries where they are assigned as TL
      if (q.tlId && q.tlId !== currentUser?.id) return false;
    } else if (role === "manager") {
      // Manager can see under their hierarchy
      if (q.managerId && q.managerId !== currentUser?.id && q.tlId !== currentUser?.id) {
        // Fallback checks or visible globally under manager
      }
    }

    // Global Search
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      const match = candName.toLowerCase().includes(queryLower) ||
                    phone.toLowerCase().includes(queryLower) ||
                    client.toLowerCase().includes(queryLower) ||
                    job.toLowerCase().includes(queryLower) ||
                    recName.toLowerCase().includes(queryLower);
      if (!match) return false;
    }

    // Advanced Filters
    if (filterName && !candName.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterPhone && !phone.toLowerCase().includes(filterPhone.toLowerCase())) return false;
    if (filterClient && !client.toLowerCase().includes(filterClient.toLowerCase())) return false;
    if (filterJob && !job.toLowerCase().includes(filterJob.toLowerCase())) return false;
    if (filterRecruiter && !recName.toLowerCase().includes(filterRecruiter.toLowerCase())) return false;
    if (filterTL && !tlName.toLowerCase().includes(filterTL.toLowerCase())) return false;
    if (filterQueryStatus && qStatus.toLowerCase() !== filterQueryStatus.toLowerCase()) return false;

    // Date Range filters
    if (filterDateRange !== "all") {
      const qDate = new Date(q.createdAt || q.queryCreatedTime);
      const now = new Date();
      if (filterDateRange === "today") {
        const isToday = qDate.getDate() === now.getDate() &&
                        qDate.getMonth() === now.getMonth() &&
                        qDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (filterDateRange === "7days") {
        const diff = (now.getTime() - qDate.getTime()) / (1000 * 3600 * 24);
        if (diff > 7) return false;
      } else if (filterDateRange === "30days") {
        const diff = (now.getTime() - qDate.getTime()) / (1000 * 3600 * 24);
        if (diff > 30) return false;
      } else if (filterDateRange === "custom") {
        if (filterStartDate) {
          const start = new Date(filterStartDate);
          start.setHours(0, 0, 0, 0);
          if (qDate < start) return false;
        }
        if (filterEndDate) {
          const end = new Date(filterEndDate);
          end.setHours(23, 59, 59, 999);
          if (qDate > end) return false;
        }
      }
    }

    return true;
  });

  const pendingQueries = filteredQueries.filter(q => q.status === "Pending");
  const resolvedQueries = filteredQueries.filter(q => q.status !== "Pending");

  // Excel Clean export
  const exportExcel = () => {
    const escapeXml = (str: any) => {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>RMS Candidate Reverts Manager</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Worksheet ss:Name="Reverts Report">
    <Table>
      <Column ss:Width="80"/>
      <Column ss:Width="120"/>
      <Column ss:Width="100"/>
      <Column ss:Width="120"/>
      <Column ss:Width="120"/>
      <Column ss:Width="100"/>
      <Column ss:Width="100"/>
      <Column ss:Width="100"/>
      <Column ss:Width="120"/>
      <Column ss:Width="150"/>
      
      <Row ss:Height="22">
        <Cell><Data ss:Type="String">Query ID</Data></Cell>
        <Cell><Data ss:Type="String">Candidate Name</Data></Cell>
        <Cell><Data ss:Type="String">Candidate Number</Data></Cell>
        <Cell><Data ss:Type="String">Client</Data></Cell>
        <Cell><Data ss:Type="String">Job Title</Data></Cell>
        <Cell><Data ss:Type="String">Recruiter</Data></Cell>
        <Cell><Data ss:Type="String">Previous Status</Data></Cell>
        <Cell><Data ss:Type="String">New Status</Data></Cell>
        <Cell><Data ss:Type="String">Query Status</Data></Cell>
        <Cell><Data ss:Type="String">Resolver Info</Data></Cell>
        <Cell><Data ss:Type="String">Resolution Notes</Data></Cell>
      </Row>`;

    filteredQueries.forEach(q => {
      xml += `
      <Row ss:Height="18">
        <Cell><Data ss:Type="String">${escapeXml(q.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.candidateName)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.candidateNumber || "N/A")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.clientName || "N/A")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.jobTitle || "N/A")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.recruiterName)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.previousStatus || q.currentStatus || "N/A")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.newStatus || "N/A")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.status)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.resolverName ? `${q.resolverName} (${q.resolverRole})` : "Unresolved")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(q.resolutionNote || "N/A")}</Data></Cell>
      </Row>`;
    });

    xml += `
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Candidate_Reverts_Report_${new Date().toISOString().split("T")[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export
  const exportCSV = () => {
    let csv = "Query ID,Candidate Name,Candidate Number,Client,Job Title,Recruiter,Previous Status,NewStatus,Query Status,Resolver,Resolution Notes\n";
    filteredQueries.forEach(q => {
      csv += `"${q.id}","${q.candidateName}","${q.candidateNumber || ''}","${q.clientName || ''}","${q.jobTitle || ''}","${q.recruiterName}","${q.previousStatus || q.currentStatus || ''}","${q.newStatus || ''}","${q.status}","${q.resolverName ? `${q.resolverName} (${q.resolverRole})` : ''}","${q.resolutionNote || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Candidate_Reverts_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const rowsHtml = filteredQueries.map(q => `
      <tr>
        <td>#${q.id}</td>
        <td><strong>${q.candidateName}</strong><br/>${q.candidateNumber || ''}</td>
        <td>${q.clientName || 'N/A'}<br/>${q.jobTitle || 'N/A'}</td>
        <td>${q.recruiterName}</td>
        <td>${q.previousStatus || q.currentStatus || 'N/A'} &rarr; <strong>${q.newStatus || 'Pending'}</strong></td>
        <td><span class="badge">${q.status}</span></td>
        <td>${q.resolverName ? `${q.resolverName} (${q.resolverRole})` : 'N/A'}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <html>
        <head>
          <title>Candidate Reverts Master System Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #334155; margin: 30px; }
            h1 { color: #1e3a8a; font-size: 22px; margin-bottom: 5px; }
            p { color: #64748b; font-size: 13px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
            th { background-color: #f8fafc; color: #1e293b; font-weight: bold; }
            .badge { background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; }
          </style>
        </head>
        <body>
          <h1>Candidate Reverts Master Audit Log</h1>
          <p>Generated on ${new Date().toLocaleDateString()} | System User Role: ${role.toUpperCase()}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate</th>
                <th>Requirement</th>
                <th>Recruiter</th>
                <th>Status Drift</th>
                <th>Query Status</th>
                <th>Resolver Node</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (selectedProfileCandidate) {
    const sc = selectedProfileCandidate;
    
    const InfoCard = ({ title, icon, children }: any) => (
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1rem", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ color: "#2563eb" }}>{icon}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px" }}>{title}</span>
        </div>
        <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem 1.5rem" }}>
          {children}
        </div>
      </div>
    );

    const F = ({ label, value }: any) => (
      <div>
        <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "3px" }}>{label}</div>
        <div style={{ fontSize: "0.875rem", color: "#111827", fontWeight: 500 }}>{value || <span style={{ color: "#d1d5db" }}>—</span>}</div>
      </div>
    );

    return (
      <div style={{ height: "100%", overflowY: "auto", background: "#f8fafc", padding: "12px 16px", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", padding: "1.5rem 2rem", borderRadius: "16px", color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
              Team Candidate Profile View
            </div>
            <button
              onClick={() => setSelectedProfileCandidate(null)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.78rem" }}
            >
              ← Back to List
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 800, color: "#fff", border: "2px solid rgba(255,255,255,0.3)" }}>
              {sc.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: "0 0 6px", color: "#fff", fontSize: "1.5rem", fontWeight: 800 }}>{sc.name}</h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                <span style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.95)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>{sc.jobRole || sc.designation || "N/A"}</span>
                <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 500 }}>📞 {sc.phone}</span>
                <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 500 }}>🏢 {sc.clientName || "N/A"}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>Recruiter In-Charge</div>
              <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "0.82rem" }}>
                {sc.recruiterName || "System Assigned"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0.75rem 2rem", display: "flex", gap: "2rem", flexWrap: "wrap", borderRadius: "12px", marginTop: "12px" }}>
          {[
            { label: "Experience", value: sc.totalExperience },
            { label: "Current CTC", value: sc.currentCtc ? `₹${sc.currentCtc}` : null },
            { label: "Expected CTC", value: sc.expectedCtc ? `₹${sc.expectedCtc}` : null },
            { label: "Notice Period", value: sc.noticePeriod },
            { label: "Sourcing Date", value: sc.sourcingDate },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: item.value ? "#1e3a8a" : "#d1d5db" }}>{item.value || "—"}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "12px" }}>
          <InfoCard title="Sourcing Information" icon={<LucideCalendar size={15} />}>
            <F label="Sourcing Date" value={sc.sourcingDate} />
            <F label="Recruiter Sourced" value={sc.recruiterName} />
            <F label="Reporting Lead" value={sc.reportingPerson} />
            <F label="Cold Calling Logs" value={sc.coldCalling} />
            <F label="Sourcing By Channel" value={sc.sourcingBy} />
            <F label="Associated Client" value={sc.clientName} />
          </InfoCard>

          <InfoCard title="Personal Credentials" icon={<LucideUsers size={15} />}>
            <F label="Full Name" value={sc.name} />
            <F label="Contact Number" value={sc.phone} />
            <F label="Personal Email" value={sc.email} />
            <F label="Date of Birth" value={sc.dob} />
            <F label="Age Group" value={sc.age} />
            <F label="Gender" value={sc.gender} />
            <F label="State Location" value={sc.state} />
            <F label="City Node" value={sc.city} />
            <F label="Qualification Level" value={sc.qualification} />
          </InfoCard>

          <InfoCard title="Professional Details" icon={<LucideBriefcase size={15} />}>
            <F label="Designation Scope" value={sc.jobRole || sc.designation} />
            <F label="Last / Current Organisation" value={sc.currentOrg} />
            <F label="Notice Window" value={sc.noticePeriod} />
            <F label="Sector Domain" value={sc.sector} />
          </InfoCard>

          <InfoCard title="CV & Live Remarks Overview" icon={<LucideUserCheck size={15} />}>
            <F label="CV Registry Status" value={sc.cvStatus} />
            <F label="CV Dispatched Group" value={sc.cvSharedWith} />
            <F label="Status Code" value={sc.remarks} />
            <F label="Remarks Reason" value={sc.remarkReason} />
          </InfoCard>

          {/* Activity Timeline */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#2563eb" }}><LucideClock size={15} /></span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px" }}>CRM Historical Timeline Logs</span>
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              {(!sc.InteractionNotes || sc.InteractionNotes.length === 0) ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                  No historical activity logged. Updates will automatically sync from Recruiter Node actions.
                </div>
              ) : (
                <div>
                  {sc.InteractionNotes.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((note: any, idx: number, arr: any[]) => (
                    <div key={note.id} style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: idx === 0 ? "#2563eb" : "#e2e8f0", border: `2px solid ${idx === 0 ? "#93c5fd" : "#f1f5f9"}`, marginTop: "4px", flexShrink: 0 }} />
                        {idx !== arr.length - 1 && <div style={{ width: "1px", flex: 1, background: "#e2e8f0", margin: "3px 0", minHeight: "20px" }} />}
                      </div>
                      <div style={{ paddingBottom: "1rem", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "2px" }}>
                          <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.85rem" }}>{note.text}</div>
                          <div style={{ fontSize: "0.7rem", color: "#9ca3af", whiteSpace: "nowrap", fontWeight: 500 }}>
                            {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          Action trigger: <span style={{ fontWeight: 600, color: "#374151" }}>{note.author?.name || "System"}</span>
                        </div>
                      </div>
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

  return (
    <div className="candidate-reverts-container" style={{ padding: "12px 16px", color: "#1e293b", fontFamily: "'Outfit', 'Inter', sans-serif", userSelect: (role === "recruiter" ? "none" : "auto") as any, WebkitUserSelect: (role === "recruiter" ? "none" : "auto") as any, MozUserSelect: (role === "recruiter" ? "none" : "auto") as any, msUserSelect: (role === "recruiter" ? "none" : "auto") as any }}>
      {/* Analytics Cards Header */}
      <div className="flex-between mb-large" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Candidate Reverts </span>
            <span style={{ color: "#2563eb" }}>Hub</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: "2px 0 0", fontWeight: 500 }}>
            Centralized status transition drift approval routing and operational oversight.
          </p>
        </div>
        {role !== "recruiter" && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={fetchQueries} className="btn-secondary flex-center gap-small" style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 800, cursor: "pointer", fontSize: "0.78rem", height: "32px" }}>
              <RefreshCw size={13} /> Refresh Nodes
            </button>
            
            <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px", height: "32px", alignItems: "center" }}>
              <button onClick={exportExcel} className="btn-text" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "none", color: "#16a34a" }}>
                <FileSpreadsheet size={13} /> Excel
              </button>
              <button onClick={exportCSV} className="btn-text" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "none", color: "#2563eb" }}>
                <Download size={13} /> CSV
              </button>
              <button onClick={exportPDF} className="btn-text" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "none", color: "#ef4444" }}>
                <FileText size={13} /> PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Dashboard Node Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", marginBottom: "16px" }}>
        {[
          { label: "Pending Reverts", val: pendingQueries.length, bg: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", icon: <Clock size={16} /> },
          { label: "Resolved Queries", val: resolvedQueries.length, bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", icon: <CheckCircle2 size={16} /> },
          { label: "Audit Coverage", val: filteredQueries.length, bg: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", icon: <ShieldCheck size={16} /> },
          { label: "Total Candidates Scope", val: filteredCandidates.length, bg: "linear-gradient(135deg, #64748b 0%, #334155 100%)", icon: <Users size={16} /> },
        ].map((card, idx) => (
          <div 
            key={idx} 
            style={{ 
              background: "white", 
              padding: "10px 12px", 
              borderRadius: "12px", 
              border: "1px solid #e2e8f0", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.01)" 
            }}
          >
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${card.bg}15`, color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {card.icon}
            </div>
            <div>
              <span style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", display: "block" }}>{card.label}</span>
              <strong style={{ fontSize: "1.1rem", fontWeight: 900, color: "#000000", marginTop: "1px", display: "block" }}>{card.val}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Global Search and Advanced Filter Panel */}
      <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "10px 12px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Real-time global search (Candidate Name, Phone, Client, Designation, Recruiter)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.8rem", fontWeight: 600, color: "#1e293b", outline: "none" }}
            />
          </div>
        </div>

        {/* Detailed Grid Filters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", fontSize: "0.75rem" }}>
          <div>
            <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Candidate Name</label>
            <input 
              type="text" 
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Filter by name..." 
              style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", minHeight: "30px" }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Candidate Phone</label>
            <input 
              type="text" 
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
              placeholder="Filter by phone..." 
              style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", minHeight: "30px" }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Client Name</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", background: "white", minHeight: "30px" }}
            >
              <option value="">All Clients</option>
              {uniqueClients.map(cl => (
                <option key={cl} value={cl}>{cl}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Job Title</label>
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", background: "white", minHeight: "30px" }}
            >
              <option value="">All Job Titles</option>
              {uniqueJobs.map(jb => (
                <option key={jb} value={jb}>{jb}</option>
              ))}
            </select>
          </div>
          {role !== "recruiter" && (
            <div>
              <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Recruiter Name</label>
              <select
                value={filterRecruiter}
                onChange={(e) => setFilterRecruiter(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", background: "white", minHeight: "30px" }}
              >
                <option value="">All Recruiters</option>
                {uniqueRecruiters.map(rec => (
                  <option key={rec} value={rec}>{rec}</option>
                ))}
              </select>
            </div>
          )}
          {role !== "recruiter" && (
            <div>
              <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Assigned TL</label>
              <input 
                type="text" 
                value={filterTL}
                onChange={(e) => setFilterTL(e.target.value)}
                placeholder="Filter by TL..." 
                style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", minHeight: "30px" }}
              />
            </div>
          )}
          <div>
            <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Candidate Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", background: "white", minHeight: "30px" }}
            >
              <option value="">All Statuses</option>
              {ALLOWED_STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Query Status</label>
            <select 
              value={filterQueryStatus}
              onChange={(e) => setFilterQueryStatus(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", background: "white", minHeight: "30px" }}
            >
              <option value="">All Queries</option>
              <option value="Pending">Pending</option>
              <option value="Resolved By TL">Resolved By TL</option>
              <option value="Resolved By Manager">Resolved By Manager</option>
              <option value="Resolved By Boss">Resolved By Boss</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Date Node Range</label>
            <select 
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem", background: "white", minHeight: "30px" }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Selectors */}
        {filterDateRange === "custom" && (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", fontSize: "0.75rem" }}>
            <div>
              <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>Start Date</label>
              <input 
                type="date" 
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem" }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>End Date</label>
              <input 
                type="date" 
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.75rem" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #cbd5e1", marginBottom: "12px", gap: "16px" }}>
        <button 
          onClick={() => setActiveTab("pending")} 
          style={{ padding: "8px 4px", background: "none", border: "none", borderBottom: activeTab === "pending" ? "3px solid #2563eb" : "none", fontWeight: 800, color: activeTab === "pending" ? "#2563eb" : "#64748b", cursor: "pointer", fontSize: "0.82rem" }}
        >
          Pending Queries ({pendingQueries.length})
        </button>
        <button 
          onClick={() => setActiveTab("resolved")} 
          style={{ padding: "8px 4px", background: "none", border: "none", borderBottom: activeTab === "resolved" ? "3px solid #2563eb" : "none", fontWeight: 800, color: activeTab === "resolved" ? "#2563eb" : "#64748b", cursor: "pointer", fontSize: "0.82rem" }}
        >
          Resolved Queries ({resolvedQueries.length})
        </button>
        <button 
          onClick={() => setActiveTab("tracker")} 
          style={{ padding: "8px 4px", background: "none", border: "none", borderBottom: activeTab === "tracker" ? "3px solid #2563eb" : "none", fontWeight: 800, color: activeTab === "tracker" ? "#2563eb" : "#64748b", cursor: "pointer", fontSize: "0.82rem" }}
        >
          Candidate Status Tracker ({filteredCandidates.length})
        </button>
        <button 
          onClick={() => setActiveTab("timeline")} 
          style={{ padding: "8px 4px", background: "none", border: "none", borderBottom: activeTab === "timeline" ? "3px solid #2563eb" : "none", fontWeight: 800, color: activeTab === "timeline" ? "#2563eb" : "#64748b", cursor: "pointer", fontSize: "0.82rem" }}
        >
          Revert Timeline & Recent Updates
        </button>
      </div>

      {/* Main Content Render */}
      {activeTab === "pending" && (
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "12px" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "2px" }}>Pending Approval Queries</h3>
          {pendingQueries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
              <Clock size={32} style={{ margin: "0 auto 8px", color: "#cbd5e1" }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.78rem" }}>No pending status revert queries found matching active filters.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              {pendingQueries.map(q => {
                const cand = candidates.find(c => String(c.id || c._id) === String(q.candidateId));

                return (
                  <div key={q.id} style={{ border: "1px solid #e0f2fe", background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)", borderRadius: "12px", padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <span style={{ fontSize: "0.6rem", background: "#dbeafe", color: "#2563eb", padding: "2px 6px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase" }}>Query #{q.id}</span>
                        <h4 style={{ fontSize: "0.92rem", fontWeight: 900, margin: "4px 0 2px", color: "#0f172a" }}>{q.candidateName}</h4>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                          {q.clientName} • {q.jobTitle}
                        </span>
                        {cand ? (
                          <div style={{ display: "flex", gap: "8px", marginTop: "6px", fontSize: "0.72rem", color: "#475569", flexWrap: "wrap", background: "rgba(255,255,255,0.6)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(224,242,254,0.6)" }}>
                            <span>📞 <strong>Phone:</strong> {cand.phone || 'N/A'}</span>
                            <span>✉️ <strong>Email:</strong> {cand.email || 'N/A'}</span>
                            <span>📍 <strong>Location:</strong> {cand.city && cand.state ? `${cand.city}, ${cand.state}` : (cand.city || cand.state || 'N/A')}</span>
                            <span>💼 <strong>Exp:</strong> {cand.totalExperience || 'N/A'}</span>
                            <span>🎓 <strong>Qual:</strong> {cand.qualification || 'N/A'}</span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", marginTop: "6px", fontSize: "0.72rem", color: "#475569", flexWrap: "wrap", background: "rgba(255,255,255,0.6)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(224,242,254,0.6)" }}>
                            <span>📞 <strong>Phone:</strong> {q.candidateNumber || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          onClick={() => setSelectedProfileCandidate(cand || { name: q.candidateName, phone: q.candidateNumber, clientName: q.clientName, designation: q.jobTitle })} 
                          className="btn-secondary" 
                          style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", padding: "6px 12px", borderRadius: "8px", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", height: "30px" }}
                        >
                          View Profile
                        </button>
                        {role !== "recruiter" && (
                          <button 
                            onClick={() => {
                              setActiveQuery(q);
                              setResolutionStatus("");
                              setResolutionRoundStatus("Round 1 Done");
                              setShowResolveModal(true);
                            }} 
                            className="btn-primary" 
                            style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem", boxShadow: "0 1px 3px rgba(37,99,235,0.1)", height: "30px" }}
                          >
                            Resolve & Override Status
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", borderTop: "1px solid #e2e8f0", paddingTop: "8px", fontSize: "0.72rem" }}>
                      <div>
                        <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>Current Status</span>
                        <strong style={{ color: "#ef4444", fontWeight: 800 }}>{q.currentStatus}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>Requested By</span>
                        <strong style={{ color: "#334155" }}>{q.recruiterName}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>Created Time</span>
                        <strong style={{ color: "#334155" }}>{new Date(q.createdAt || q.queryCreatedTime).toLocaleString()}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>TL / Manager Alignment</span>
                        <strong style={{ color: "#334155" }}>{q.tlName || "N/A"} / {q.managerName || "N/A"}</strong>
                      </div>
                    </div>

                    {q.queryReason && (
                      <div style={{ marginTop: "8px", background: "white", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.72rem" }}>
                        <strong style={{ color: "#0f172a", display: "block", marginBottom: "2px" }}>Query Reason Notes:</strong>
                        <span style={{ color: "#475569" }}>{q.queryReason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "resolved" && (
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "12px" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "2px" }}>Resolved Status Reverts</h3>
          {resolvedQueries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
              <CheckCircle2 size={32} style={{ margin: "0 auto 8px", color: "#cbd5e1" }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.78rem" }}>No resolved status reverts in this context.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              {resolvedQueries.map(q => {
                const cand = candidates.find(c => String(c.id || c._id) === String(q.candidateId));

                return (
                  <div key={q.id} style={{ border: "1px solid #dcfce7", background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)", borderRadius: "12px", padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <span style={{ fontSize: "0.6rem", background: "#dcfce7", color: "#16a34a", padding: "2px 6px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase" }}>Query #{q.id}</span>
                        <h4 style={{ fontSize: "0.92rem", fontWeight: 950, margin: "4px 0 2px", color: "#0f172a" }}>{q.candidateName}</h4>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                          {q.clientName} • {q.jobTitle}
                        </span>
                        {cand ? (
                          <div style={{ display: "flex", gap: "8px", marginTop: "6px", fontSize: "0.72rem", color: "#475569", flexWrap: "wrap", background: "rgba(255,255,255,0.6)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(220,252,231,0.6)" }}>
                            <span>📞 <strong>Phone:</strong> {cand.phone || 'N/A'}</span>
                            <span>✉️ <strong>Email:</strong> {cand.email || 'N/A'}</span>
                            <span>📍 <strong>Location:</strong> {cand.city && cand.state ? `${cand.city}, ${cand.state}` : (cand.city || cand.state || 'N/A')}</span>
                            <span>💼 <strong>Exp:</strong> {cand.totalExperience || 'N/A'}</span>
                            <span>🎓 <strong>Qual:</strong> {cand.qualification || 'N/A'}</span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", marginTop: "6px", fontSize: "0.72rem", color: "#475569", flexWrap: "wrap", background: "rgba(255,255,255,0.6)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(220,252,231,0.6)" }}>
                            <span>📞 <strong>Phone:</strong> {q.candidateNumber || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          onClick={() => setSelectedProfileCandidate(cand || { name: q.candidateName, phone: q.candidateNumber, clientName: q.clientName, designation: q.jobTitle })} 
                          className="btn-secondary" 
                          style={{ background: "#ffffff", border: "1.5px solid #cbd5e1", color: "#475569", padding: "6px 12px", borderRadius: "8px", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", height: "30px" }}
                        >
                          View Profile
                        </button>
                        <span style={{ display: "inline-block", background: "#16a34a", color: "white", fontSize: "0.7rem", fontWeight: 800, padding: "6px 10px", borderRadius: "6px", alignSelf: "flex-start" }}>
                          {q.status}{q.resolverName ? ` (${q.resolverName})` : ""}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", borderTop: "1px solid #cbd5e1", paddingTop: "8px", fontSize: "0.72rem" }}>
                      <div>
                        <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>Previous Status</span>
                        <strong style={{ color: "#64748b", textDecoration: "line-through" }}>{q.previousStatus || q.currentStatus}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>Resolved Status</span>
                        <strong style={{ color: "#16a34a", fontWeight: 800 }}>{q.newStatus}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>Resolved By</span>
                        <strong style={{ color: "#334155" }}>{q.resolverName} ({q.resolverRole})</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>Resolution Date</span>
                        <strong style={{ color: "#334155" }}>{q.resolutionTime ? new Date(q.resolutionTime).toLocaleString() : "N/A"}</strong>
                      </div>
                    </div>

                    {q.resolutionNote && (
                      <div style={{ marginTop: "8px", background: "white", padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.72rem" }}>
                        <strong style={{ color: "#0f172a", display: "block", marginBottom: "2px" }}>Resolution Notes:</strong>
                        <span style={{ color: "#475569" }}>{q.resolutionNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "tracker" && (
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "12px" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "2px" }}>Candidate Status Tracker</h3>
          {filteredCandidates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
              <Users size={32} style={{ margin: "0 auto 8px", color: "#cbd5e1" }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.78rem" }}>No candidates in appropriate status range found matching active filters.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "linear-gradient(90deg, #0369a1 0%, #0ea5e9 100%)", height: "32px" }}>
                    <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>ID</th>
                    <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Candidate Details</th>
                    <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Client / Job</th>
                    <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Recruiter Name</th>
                    <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff", textAlign: "center" }}>Reverts Count</th>
                    <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff" }}>Current Status</th>
                    {role === "recruiter" && <th style={{ padding: "6px 10px", fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", color: "#ffffff", textAlign: "center" }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c, idx) => {
                    const cid = c.id || c._id;
                    const pendingQuery = queries.find(q => String(q.candidateId) === String(cid) && q.status === "Pending");
                    const status = pendingQuery ? pendingQuery.currentStatus : (c.remarks || "New");
                    const hasPendingQuery = !!pendingQuery;
                    const hasPastRevert = queries.some(q => String(q.candidateId) === String(cid) && q.status !== "Pending");
                    const revertCount = queries.filter(q => String(q.candidateId) === String(cid)).length;

                    return (
                      <tr key={cid} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#f8fafc" : "#ffffff" }}>
                        <td style={{ padding: "6px 10px", fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>#{cid}</td>
                        <td style={{ padding: "6px 10px" }}>
                          <strong style={{ display: "block", color: "#1e293b", fontSize: "0.78rem" }}>{c.name}</strong>
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{c.phone}</span>
                        </td>
                        <td style={{ padding: "6px 10px" }}>
                          <span style={{ display: "block", color: "#334155", fontWeight: 700, fontSize: "0.75rem" }}>{c.clientName || "Direct / No Client"}</span>
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{c.designation || c.jobRole || "N/A"}</span>
                        </td>
                        <td style={{ padding: "6px 10px", fontWeight: 600, color: "#334155", fontSize: "0.75rem" }}>{c.recruiterName || "Company Root"}</td>
                        <td style={{ padding: "6px 10px", textAlign: "center" }}>
                          <span style={{ display: "inline-block", background: revertCount > 0 ? "#eff6ff" : "#f1f5f9", color: revertCount > 0 ? "#2563eb" : "#64748b", padding: "2px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "0.75rem", border: revertCount > 0 ? "1px solid #bfdbfe" : "1px solid #e2e8f0" }}>
                            {revertCount}
                          </span>
                        </td>
                        <td style={{ padding: "6px 10px" }}>
                          {role === "recruiter" ? (
                            <span style={{ display: "inline-block", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: 800, fontSize: "0.65rem", color: "#475569" }}>
                              {status}
                            </span>
                          ) : (
                            <select
                              value={status}
                              onChange={(e) => handleDirectStatusChange(c, e.target.value)}
                              disabled={updatingCandidateId === String(cid)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "8px",
                                border: "1.5px solid #cbd5e1",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                background: "#ffffff",
                                color: "#1e293b",
                                outline: "none",
                                cursor: "pointer",
                                width: "100%",
                                minWidth: "150px"
                              }}
                            >
                              <option value="">Select Status...</option>
                              {getStatusOptions(c).map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        {role === "recruiter" && (
                          <td style={{ padding: "4px 10px", textAlign: "center" }}>
                            {hasPendingQuery ? (
                              <span style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 800 }}>
                                Query Pending
                              </span>
                            ) : (
                              <button 
                                onClick={() => {
                                  setSelectedCandidate(c);
                                  setShowAskRevertModal(true);
                                }}
                                className="btn-primary" 
                                style={{ background: "#2563eb", color: "white", border: "none", padding: "4px 8px", borderRadius: "6px", fontWeight: 800, cursor: "pointer", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "3px" }}
                              >
                                <Plus size={10} /> {hasPastRevert ? "ASK REVERT AGAIN" : "ASK REVERT"}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "timeline" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px" }}>
          {/* Revert Timeline */}
          <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "12px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Revert Action Timeline</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", paddingLeft: "14px", borderLeft: "2px dashed #cbd5e1" }}>
              {filteredQueries.slice(0, 10).map((q, i) => (
                <div key={q.id} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "-21px", top: "2px", background: q.status === "Pending" ? "#2563eb" : "#16a34a", color: "white", width: "10px", height: "10px", borderRadius: "50%", border: "2px solid white" }} />
                  
                  <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b", marginBottom: "2px" }}>
                      <span>Query #{q.id}</span>
                      <span>{new Date(q.createdAt || q.queryCreatedTime).toLocaleDateString()}</span>
                    </div>
                    <strong style={{ fontSize: "0.82rem", color: "#0f172a", display: "block" }}>{q.candidateName}</strong>
                    <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                      Recruiter {q.recruiterName} requested review.
                    </span>

                    {q.status !== "Pending" ? (
                      <div style={{ marginTop: "4px", fontSize: "0.75rem", borderTop: "1px solid #e2e8f0", paddingTop: "4px", color: "#16a34a" }}>
                        <strong>Resolved to {q.newStatus} by {q.resolverName} ({q.resolverRole})</strong>
                        {q.resolutionNote && <p style={{ margin: "2px 0 0", color: "#475569", fontStyle: "italic" }}>"{q.resolutionNote}"</p>}
                      </div>
                    ) : (
                      <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>
                        ⏳ Currently Pending Approvals
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredQueries.length === 0 && (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "10px 0", fontSize: "0.75rem" }}>No timelines generated.</p>
              )}
            </div>
          </div>

          {/* Recent updates list */}
          <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "12px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Recent Audits & Logs</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredQueries.filter(q => q.status !== "Pending").slice(0, 10).map(q => (
                <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "4px", borderRadius: "6px" }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", display: "block" }}>{q.resolutionTime ? new Date(q.resolutionTime).toLocaleString() : "N/A"}</span>
                    <strong style={{ fontSize: "0.78rem", color: "#1e293b", display: "block" }}>
                      {q.resolverName} resolved query #{q.id}
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Candidate <strong>{q.candidateName}</strong> transitioned from {q.previousStatus || q.currentStatus} to <strong>{q.newStatus}</strong>.
                    </span>
                  </div>
                </div>
              ))}
              {filteredQueries.filter(q => q.status !== "Pending").length === 0 && (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "10px 0", fontSize: "0.75rem" }}>No recent audit activity records.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recruiter ask revert modal */}
      {showAskRevertModal && selectedCandidate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1.5px solid #e2e8f0", width: "420px", maxWidth: "90%" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 950, marginBottom: "8px", color: "#0f172a" }}>ASK REVERT APPROVAL</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
              Requesting superiors (TL, Manager, Boss) to review status transition logic for candidate {selectedCandidate.name}.
            </p>
            
            <form onSubmit={handleAskRevertSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "6px" }}>Current Status</label>
                <input 
                  type="text" 
                  value={selectedCandidate.remarks || "Interested"} 
                  disabled 
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: "0.9rem", fontWeight: 700 }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "6px" }}>Query Reason / Context</label>
                <textarea 
                  value={askRevertReason}
                  onChange={(e) => setAskRevertReason(e.target.value)}
                  placeholder="Explain why you need status changes approved..."
                  required
                  rows={4}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.85rem", outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAskRevertModal(false);
                    setSelectedCandidate(null);
                  }} 
                  style={{ padding: "10px 16px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#2563eb", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Send Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve modal for TL/Manager/Boss */}
      {showResolveModal && activeQuery && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1.5px solid #e2e8f0", width: "480px", maxWidth: "90%" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 950, marginBottom: "4px", color: "#0f172a" }}>Resolve Query #{activeQuery.id}</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
              Resolving candidate status drift for <strong>{activeQuery.candidateName}</strong> requested by {activeQuery.recruiterName}.
            </p>

            <form onSubmit={handleResolveSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "6px" }}>New Candidate Status</label>
                <select 
                  value={resolutionStatus} 
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", fontWeight: 700, background: "white" }}
                >
                  <option value="">Select Target Status...</option>
                  {getStatusOptions(candidates.find(c => String(c.id || c._id) === String(activeQuery.candidateId))).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const resolvedCand = candidates.find(c => String(c.id || c._id) === String(activeQuery.candidateId));
                const resolvedCandJob = resolvedCand ? activeJobs.find(job => 
                  (job.title?.toLowerCase() === resolvedCand.designation?.toLowerCase() || job.title?.toLowerCase() === resolvedCand.jobRole?.toLowerCase()) &&
                  (job.client?.name?.toLowerCase() === resolvedCand.clientName?.toLowerCase())
                ) || activeJobs.find(job => 
                  (job.title?.toLowerCase() === resolvedCand.designation?.toLowerCase() || job.title?.toLowerCase() === resolvedCand.jobRole?.toLowerCase())
                ) : null;

                if (resolutionStatus === "Interview Done" && resolvedCandJob && resolvedCandJob.interviewRounds > 1) {
                  return (
                    <div style={{ marginTop: "10px", background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "14px", borderRadius: "14px", marginBottom: "14px" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "6px" }}>Select Completed Round</label>
                      <select 
                        value={resolutionRoundStatus} 
                        onChange={(e) => setResolutionRoundStatus(e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.9rem", fontWeight: 700, background: "white" }}
                      >
                        {Array.from({ length: resolvedCandJob.interviewRounds }).map((_, idx) => {
                          const roundNum = idx + 1;
                          const roundText = `Round ${roundNum} Done`;
                          return <option key={roundNum} value={roundText}>{roundText}</option>;
                        })}
                        <option value="All Round Done">All Round Done</option>
                      </select>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Schedule Later Options */}
              {resolutionStatus === "Schedule Later" && (
                <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "14px", borderRadius: "14px", marginBottom: "14px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "8px" }}>Schedule Type</label>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <button 
                      type="button" 
                      onClick={() => setScheduleType("today")}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", border: scheduleType === "today" ? "2px solid #2563eb" : "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem", color: scheduleType === "today" ? "#2563eb" : "#475569" }}
                    >
                      Today
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setScheduleType("tomorrow")}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", border: scheduleType === "tomorrow" ? "2px solid #2563eb" : "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem", color: scheduleType === "tomorrow" ? "#2563eb" : "#475569" }}
                    >
                      Tomorrow
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setScheduleType("custom")}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", border: scheduleType === "custom" ? "2px solid #2563eb" : "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem", color: scheduleType === "custom" ? "#2563eb" : "#475569" }}
                    >
                      Custom Date
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: scheduleType === "custom" ? "1fr 1fr" : "1fr", gap: "10px" }}>
                    {scheduleType === "custom" && (
                      <div>
                        <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", display: "block", marginBottom: "4px" }}>Select Date</label>
                        <input 
                          type="date" 
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          required
                          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem" }}
                        />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", display: "block", marginBottom: "4px" }}>Select Time</label>
                      <input 
                        type="time" 
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "6px" }}>Resolution Note & Remarks</label>
                <textarea 
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Add details, remarks, or alignment reasoning for recruiter visibility..."
                  required
                  rows={3}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.85rem", outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowResolveModal(false);
                    setActiveQuery(null);
                    setResolutionStatus("");
                    setResolutionNote("");
                  }} 
                  style={{ padding: "10px 16px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#16a34a", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Resolve Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Direct Schedule modal for TL/Manager/Boss direct status update to Schedule Later */}
      {showDirectScheduleModal && directScheduleCandidate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1.5px solid #e2e8f0", width: "480px", maxWidth: "90%" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 950, marginBottom: "4px", color: "#0f172a" }}>Schedule Interview</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
              Directly schedule interview for candidate <strong>{directScheduleCandidate.name}</strong> as <strong>{role.toUpperCase()}</strong>.
            </p>

            <form onSubmit={handleDirectScheduleSubmit}>
              {/* Schedule Later Options */}
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "14px", borderRadius: "14px", marginBottom: "14px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "8px" }}>Schedule Type</label>
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <button 
                    type="button" 
                    onClick={() => setScheduleType("today")}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: scheduleType === "today" ? "2px solid #2563eb" : "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem", color: scheduleType === "today" ? "#2563eb" : "#475569" }}
                  >
                    Today
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setScheduleType("tomorrow")}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: scheduleType === "tomorrow" ? "2px solid #2563eb" : "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem", color: scheduleType === "tomorrow" ? "#2563eb" : "#475569" }}
                  >
                    Tomorrow
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setScheduleType("custom")}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", border: scheduleType === "custom" ? "2px solid #2563eb" : "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.8rem", color: scheduleType === "custom" ? "#2563eb" : "#475569" }}
                  >
                    Custom Date
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: scheduleType === "custom" ? "1fr 1fr" : "1fr", gap: "10px" }}>
                  {scheduleType === "custom" && (
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", display: "block", marginBottom: "4px" }}>Select Date</label>
                      <input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem" }}
                      />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", display: "block", marginBottom: "4px" }}>Select Time</label>
                    <input 
                      type="time" 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      required
                      style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", display: "block", marginBottom: "6px" }}>Scheduling Note & Remarks</label>
                <textarea 
                  value={directResolutionNote}
                  onChange={(e) => setDirectResolutionNote(e.target.value)}
                  placeholder="Add details, remarks, or alignment reasoning for the candidate timeline..."
                  required
                  rows={3}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "0.85rem", outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowDirectScheduleModal(false);
                    setDirectScheduleCandidate(null);
                    setDirectScheduleStatus("");
                    setDirectResolutionNote("");
                  }} 
                  style={{ padding: "10px 16px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#16a34a", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview Done round picker modal for TL/Manager/Boss direct status update */}
      {showInterviewDoneModal && interviewDoneCandidate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1.5px solid #e2e8f0", width: "420px", maxWidth: "90%" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 950, marginBottom: "4px", color: "#0f172a" }}>Select Completed Round</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
              Candidate <strong>{interviewDoneCandidate.name}</strong> has multiple interview rounds. Select which round has been completed:
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Array.from({ length: interviewDoneRounds }).map((_, idx) => {
                const roundNum = idx + 1;
                const roundText = `Round ${roundNum} Done`;
                return (
                  <button
                    key={roundNum}
                    type="button"
                    onClick={() => handleDirectInterviewDoneSelect(interviewDoneCandidate, roundText)}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1.5px solid #cbd5e1",
                      background: "#f8fafc",
                      color: "#1e293b",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      textAlign: "left",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#eff6ff";
                      e.currentTarget.style.borderColor = "#3b82f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                  >
                    {roundText}
                  </button>
                );
              })}
              
              <button
                type="button"
                onClick={() => handleDirectInterviewDoneSelect(interviewDoneCandidate, "All Round Done")}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1.5px solid #16a34a",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#dcfce7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f0fdf4";
                }}
              >
                All Round Done
              </button>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button 
                type="button" 
                onClick={() => {
                  setShowInterviewDoneModal(false);
                  setInterviewDoneCandidate(null);
                }} 
                style={{ padding: "8px 16px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        ${role === "recruiter" ? `
          .candidate-reverts-container input, 
          .candidate-reverts-container select, 
          .candidate-reverts-container textarea {
            user-select: text !important;
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
          }
        ` : ''}
      `}</style>
    </div>
  );
}
