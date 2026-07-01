import { useState, useEffect, useRef, useMemo } from "react";
import { 
  LucideFilter, 
  LucideDownload, 
  LucideUsers, 
  LucideBriefcase, 
  LucideTrendingUp, 
  LucideArrowRight, 
  LucideCheckCircle2, 
  LucideAlertTriangle, 
  LucideShieldCheck, 
  LucideActivity, 
  LucideClock, 
  LucideCoffee, 
  LucideAward, 
  LucideCalendar, 
  LucideDatabase, 
  LucideMail, 
  LucideSearch, 
  LucideSparkles, 
  LucideDollarSign, 
  LucideSliders, 
  LucideX, 
  LucideChevronRight, 
  LucidePrinter, 
  LucideRefreshCcw,
  LucideClipboardList,
  LucideCpu,
  LucideMapPin,
  LucideTrendingDown,
  LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BossReports() {
  // Filter States
  const [dateMode, setDateMode] = useState("last_30");
  const [activeReportSubTab, setActiveReportSubTab] = useState<"reports" | "analysis">("reports");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedTL, setSelectedTL] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedSourcing, setSelectedSourcing] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  // Data State
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drilldown states
  const [activeDrilldown, setActiveDrilldown] = useState<{ type: string; id: any; name: string } | null>(null);
  const [selectedRecruiterProfile, setSelectedRecruiterProfile] = useState<any>(null);
  const [selectedTLProfile, setSelectedTLProfile] = useState<any>(null);
  const [selectedManagerProfile, setSelectedManagerProfile] = useState<any>(null);

  // Dynamic Drilldown Candidate data
  const [drilldownCandidates, setDrilldownCandidates] = useState<any[]>([]);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);

  // Scheduled Reports Config State
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState("daily");
  const [deliveryChannel, setDeliveryChannel] = useState({ inbox: true, gmail: false, hostinger: false });
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // New merged panels and leaderboard custom toggle states
  const [clientJobToggle, setClientJobToggle] = useState("client");
  const [pipelineRoundToggle, setPipelineRoundToggle] = useState("pipeline");
  const [leaderboardRole, setLeaderboardRole] = useState<"recruiter" | "tl" | "manager">("recruiter");
  const [leaderboardMetric, setLeaderboardMetric] = useState<"productivity" | "sourced" | "selected" | "joined">("sourced");
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);

  const sortedLeaderboardList = useMemo(() => {
    if (!data) return [];
    const rolesMapping: Record<string, string> = {
      recruiter: "recruiter",
      tl: "tl",
      manager: "manager"
    };
    const targetRole = rolesMapping[leaderboardRole] || "recruiter";
    const rawList = (data.teams || []).filter((t: any) => t.role === targetRole);
    
    const sorted = [...rawList].sort((a: any, b: any) => {
      if (leaderboardMetric === "productivity") {
        return (b.performanceScore || 0) - (a.performanceScore || 0);
      } else if (leaderboardMetric === "sourced") {
        return (b.registrations || 0) - (a.registrations || 0);
      } else if (leaderboardMetric === "selected") {
        return (b.selected || 0) - (a.selected || 0);
      } else if (leaderboardMetric === "joined") {
        return (b.joined || 0) - (a.joined || 0);
      }
      return 0;
    });
    return sorted;
  }, [data, leaderboardRole, leaderboardMetric]);

  // Fetch Reports Telemetry
  const fetchReportsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        dateMode,
        startDate,
        endDate,
        managerId: selectedManager,
        tlId: selectedTL,
        recruiterId: selectedRecruiter,
        clientName: selectedClient,
        jobTitle: selectedJob,
        vendorId: selectedVendor,
        sourcing: selectedSourcing,
        shiftId: selectedShift,
        teamId: selectedTeam
      });
      const res = await fetch(`/api/boss/reports-hub?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to parse company intelligence pipeline");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Pipeline integration fault");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [
    dateMode, startDate, endDate, selectedManager, selectedTL,
    selectedRecruiter, selectedClient, selectedJob, selectedVendor,
    selectedSourcing, selectedShift, selectedTeam
  ]);

  useEffect(() => {
    if (activeDrilldown) {
      fetchDrilldownData();
    } else {
      setDrilldownCandidates([]);
    }
  }, [activeDrilldown]);

  const fetchDrilldownData = async () => {
    setLoadingDrilldown(true);
    try {
      const res = await fetch("/api/candidates");
      if (res.ok) {
        const json = await res.json();
        const filtered = json.filter((c: any) => {
          if (!activeDrilldown) return false;
          if (activeDrilldown.type === "client") {
            return c.clientName === activeDrilldown.name;
          }
          if (activeDrilldown.type === "job") {
            return c.jobRole === activeDrilldown.name || c.designation === activeDrilldown.name;
          }
          if (activeDrilldown.type === "vendor") {
            return c.sourcingBy && c.sourcingBy.toLowerCase().includes("vendor") && c.sourcingBy.includes(activeDrilldown.name);
          }
          return true;
        });
        setDrilldownCandidates(filtered);
      }
    } catch (err) {
      console.error("Failed to load drilldown candidates", err);
    } finally {
      setLoadingDrilldown(false);
    }
  };

  const handleDownloadFullReportPDF = (individual: any) => {
    if (!data) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download the PDF report.");
      return;
    }

    // Get selected time scope label
    let timeLabel = "";
    if (dateMode === "today") timeLabel = "Today";
    else if (dateMode === "yesterday") timeLabel = "Yesterday";
    else if (dateMode === "last_7") timeLabel = "Last 7 Days";
    else if (dateMode === "last_30") timeLabel = "Last 30 Days";
    else if (dateMode === "last_90") timeLabel = "Last 90 Days";
    else if (dateMode === "this_month") timeLabel = "This Month";
    else if (dateMode === "last_month") timeLabel = "Last Month";
    else if (dateMode === "quarterly") timeLabel = "Quarterly";
    else if (dateMode === "yearly") timeLabel = "Yearly";
    else if (dateMode === "custom") timeLabel = `Custom: ${startDate || "N/A"} to ${endDate || "N/A"}`;

    // Find ranking/performance score for this individual
    const rankedRecruiters = leaderboards.recruiters || [];
    const rankedTls = leaderboards.tls || [];
    const rankedManagers = leaderboards.managers || [];
    const allRanked = [...rankedRecruiters, ...rankedTls, ...rankedManagers];
    const indRankInfo = allRanked.find((x: any) => String(x.id) === String(individual.id)) || {};

    const formattedRole = individual.role ? individual.role.toUpperCase() : "N/A";
    const supervisorName = indRankInfo.supervisor || "Boss";
    const userRank = indRankInfo.ranking || "N/A";
    const userScore = indRankInfo.performanceScore || 0;

    // Render core metrics table
    const coreMetrics = [
      { name: "Registered Sourced", val: recruitment.regCandidates || 0 },
      { name: "Connected Candidates", val: recruitment.connected || 0 },
      { name: "Interested Candidates", val: recruitment.interested || 0 },
      { name: "Processing For Interview", val: recruitment.processingForNextRound || 0 },
      { name: "Interview Done", val: recruitment.interviewDone || 0 },
      { name: "Go For Interview", val: recruitment.goForInterview || 0 },
      { name: "Hired/Selected", val: recruitment.selected || 0 },
      { name: "Onboarded & Joined", val: recruitment.joined || 0 },
      { name: "Not Interested Candidates", val: recruitment.notInterested || 0 },
      { name: "Rejected Candidates", val: recruitment.rejected || 0 },
    ];

    // Build client table rows
    const clientRows = clients.map((cl: any) => `
      <tr>
        <td style="font-weight: bold; text-align: left;">${cl.clientName}</td>
        <td>${cl.totalCandidates || 0}</td>
        <td>${cl.connected || 0}</td>
        <td>${cl.interested || 0}</td>
        <td>${cl.processingForNextRound || 0}</td>
        <td>${cl.interviewDone || 0}</td>
        <td>${cl.interview || 0}</td>
        <td>${cl.selected || 0}</td>
        <td>${cl.joined || 0}</td>
        <td>${cl.notInterested || 0}</td>
        <td>${cl.rejected || 0}</td>
      </tr>
    `).join("");

    // Build job table rows
    const jobRows = jobs.map((jb: any) => `
      <tr>
        <td style="font-weight: bold; text-align: left;">${jb.jobTitle}</td>
        <td>${jb.totalCandidates || 0}</td>
        <td>${jb.connected || 0}</td>
        <td>${jb.interested || 0}</td>
        <td>${jb.processingForNextRound || 0}</td>
        <td>${jb.interviewDone || 0}</td>
        <td>${jb.interview || 0}</td>
        <td>${jb.selected || 0}</td>
        <td>${jb.joined || 0}</td>
        <td>${jb.notInterested || 0}</td>
        <td>${jb.rejected || 0}</td>
      </tr>
    `).join("");

    // Build vendor table rows
    const vendorRows = vendors.map((v: any) => `
      <tr>
        <td style="font-weight: bold; text-align: left;">${v.vendorName}</td>
        <td>${v.candidatesShared || 0}</td>
        <td>${v.connected || 0}</td>
        <td>${v.selected || 0}</td>
        <td>${v.joined || 0}</td>
        <td>${v.rejected || 0}</td>
        <td>${v.dropped || 0}</td>
      </tr>
    `).join("");

    // Build sourcing platforms rows
    const sourcingRows = sources.map((s: any) => `
      <tr>
        <td style="font-weight: bold; text-align: left;">${s.sourceName}</td>
        <td>${s.candidatesGenerated || 0}</td>
        <td>${s.connected || 0}</td>
        <td>${s.interested || 0}</td>
        <td>${s.selected || 0}</td>
        <td>${s.joined || 0}</td>
        <td>${s.conversionRate || 0}%</td>
        <td>${s.sourceQualityScore || 0}%</td>
      </tr>
    `).join("");

    // Build lead bank breakdown rows
    const leadRows = (leads.categoryBreakdown || []).map((l: any) => `
      <tr>
        <td style="font-weight: bold; text-align: left;">${l.category}</td>
        <td>${l.count || 0}</td>
        <td>${l.conversion || 0}</td>
        <td>${l.count > 0 ? Math.round((l.conversion / l.count) * 100) : 0}%</td>
      </tr>
    `).join("");

    // Build task metrics info
    const totalTasks = tasks.assignedTasks || 0;
    const activeTasks = tasks.activeTasks || 0;
    const completedTasks = tasks.completedTasks || 0;
    const overdueTasks = tasks.expiredTasks || 0;

    // Build attendance rows
    const attList = dailyAttendance.length > 0 ? dailyAttendance : attendance;
    const isDaily = dailyAttendance.length > 0;
    const firstColHeader = isDaily ? "Date" : "Employee Name";

    const attendanceRows = attList.map((a: any) => `
      <tr>
        <td style="font-weight: bold; text-align: left;">${a.date || a.employeeName || "N/A"}</td>
        <td>${a.checkInTime || a.clockIn || "N/A"}</td>
        <td>${a.checkOutTime || a.clockOut || "N/A"}</td>
        <td>${a.workingHours || "0.00 hrs"}</td>
        <td>${a.breakCount || 0}</td>
        <td>${a.lateLogin || "No"}</td>
        <td>${a.lateLogout || "No"}</td>
        <td>${a.efficiency || "0%"}</td>
      </tr>
    `).join("");

    // HTML Content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Full Audit Report - ${individual.name}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1e293b;
            line-height: 1.4;
            padding: 20px;
            background: #ffffff;
            margin: 0;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .logo-text {
            font-size: 1.6rem;
            font-weight: 900;
            color: #1e3a8a;
            margin: 0;
          }
          .report-title {
            font-size: 1.1rem;
            font-weight: 800;
            color: #4b5563;
            margin: 2px 0 0;
          }
          .metadata-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px 18px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
          .meta-item h4 {
            margin: 0 0 4px;
            font-size: 0.68rem;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .meta-item p {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 800;
            color: #0f172a;
          }
          .section-title {
            font-size: 1.05rem;
            font-weight: 900;
            color: #0f172a;
            border-left: 4px solid #3b82f6;
            padding-left: 8px;
            margin: 24px 0 12px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .grid-2-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .metric-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 20px;
          }
          .metric-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 10px;
            text-align: center;
          }
          .metric-box span {
            font-size: 0.65rem;
            font-weight: 800;
            color: #64748b;
            display: block;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .metric-box strong {
            font-size: 1.2rem;
            font-weight: 900;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 0.78rem;
          }
          th {
            background: #f1f5f9;
            color: #475569;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 0.68rem;
            letter-spacing: 0.02em;
            border: 1px solid #e2e8f0;
            padding: 6px 8px;
            text-align: center;
          }
          td {
            border: 1px solid #e2e8f0;
            padding: 6px 8px;
            text-align: center;
          }
          tr:nth-child(even) {
            background: #f8fafc;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            text-align: center;
            font-size: 0.68rem;
            color: #94a3b8;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.85rem; color: #1e40af; font-weight: bold;">Document ready for printing. Save as PDF or print.</span>
          <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 6px 14px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">Print Report</button>
        </div>

        <div class="header-container">
          <div>
            <h1 class="logo-text">GIVYANSH CRM - EXECUTIVE SUITE</h1>
            <h2 class="report-title">Employee Performance Audit Profile</h2>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 0.8rem; color: #64748b; font-weight: bold;">Generated: ${new Date().toLocaleString()}</p>
            <p style="margin: 2px 0 0; font-size: 0.8rem; color: #3b82f6; font-weight: 800;">CONFIDENTIAL</p>
          </div>
        </div>

        <div class="metadata-card">
          <div class="meta-item">
            <h4>Employee Name</h4>
            <p>${individual.name}</p>
          </div>
          <div class="meta-item">
            <h4>Role / Grade</h4>
            <p>${formattedRole}</p>
          </div>
          <div class="meta-item">
            <h4>Direct Supervisor</h4>
            <p>${supervisorName}</p>
          </div>
          <div class="meta-item">
            <h4>Temporal Scope</h4>
            <p>${timeLabel}</p>
          </div>
        </div>

        <div class="section-title">Core Performance Metrics</div>
        <div class="metadata-card" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 15px;">
          <div class="meta-item">
            <h4>Organizational Rank</h4>
            <p>#${userRank}</p>
          </div>
          <div class="meta-item">
            <h4>Performance Rating Score</h4>
            <p>${userScore}%</p>
          </div>
          <div class="meta-item">
            <h4>Leads Contributed</h4>
            <p>${indRankInfo.leadsGenerated || 0} Corporate Leads</p>
          </div>
          <div class="meta-item">
            <h4>Tasks Accomplished</h4>
            <p>${indRankInfo.tasksCompleted || 0} Tasks</p>
          </div>
        </div>

        <div class="section-title">Candidate Pipeline Funnel</div>
        <div class="metric-grid">
          ${coreMetrics.map(m => `
            <div class="metric-box">
              <span>${m.name}</span>
              <strong>${m.val}</strong>
            </div>
          `).join("")}
        </div>

        <div class="section-title">Client-Wise Sourcing Distribution</div>
        ${clients.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Client Account</th>
                <th>Sourced</th>
                <th>Connected</th>
                <th>Interested</th>
                <th>Processing</th>
                <th>Intv Done</th>
                <th>Go For Intv</th>
                <th>Selected</th>
                <th>Joined</th>
                <th>Not Int.</th>
                <th>Rejected</th>
              </tr>
            </thead>
            <tbody>
              ${clientRows}
            </tbody>
          </table>
        ` : `<p style="font-size: 0.8rem; color: #64748b; font-style: italic;">No client sourcing activity mapped for this period.</p>`}

        <div class="page-break"></div>

        <div class="section-title">Job Mandate Conversions</div>
        ${jobs.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Job Mandate</th>
                <th>Sourced</th>
                <th>Connected</th>
                <th>Interested</th>
                <th>Processing</th>
                <th>Intv Done</th>
                <th>Go For Intv</th>
                <th>Selected</th>
                <th>Joined</th>
                <th>Not Int.</th>
                <th>Rejected</th>
              </tr>
            </thead>
            <tbody>
              ${jobRows}
            </tbody>
          </table>
        ` : `<p style="font-size: 0.8rem; color: #64748b; font-style: italic;">No job mandate conversion data mapped for this period.</p>`}

        <div class="section-title">Vendor Channels & Associated Contributions</div>
        <div style="font-size: 0.8rem; font-weight: 800; color: #4b5563; margin-bottom: 8px;">
          Total Connected Vendors: ${vendors.length}
        </div>
        ${vendors.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Vendor Agency</th>
                <th>Shared</th>
                <th>Connected</th>
                <th>Selected</th>
                <th>Joined</th>
                <th>Rejected</th>
                <th>Dropped</th>
              </tr>
            </thead>
            <tbody>
              ${vendorRows}
            </tbody>
          </table>
        ` : `<p style="font-size: 0.8rem; color: #64748b; font-style: italic;">No vendor channels mapped to candidate contributions for this employee.</p>`}

        <div class="section-title">Sourcing Platforms Distribution</div>
        ${sources.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Platform Channel</th>
                <th>Generated</th>
                <th>Connected</th>
                <th>Interested</th>
                <th>Selected</th>
                <th>Joined</th>
                <th>Join %</th>
                <th>Quality Index</th>
              </tr>
            </thead>
            <tbody>
              ${sourcingRows}
            </tbody>
          </table>
        ` : `<p style="font-size: 0.8rem; color: #64748b; font-style: italic;">No sourcing platform distribution records found.</p>`}

        <div class="page-break"></div>

        <div class="grid-2-col">
          <div>
            <div class="section-title">Corporate Lead Bank Overview</div>
            <div style="font-size: 0.8rem; font-weight: 800; color: #4b5563; margin-bottom: 8px;">
              Total Leads Generated: ${leads.totalLeads || 0} | Converted: ${leads.leadConversion || 0}
            </div>
            ${(leads.categoryBreakdown || []).length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th style="text-align: left;">Industry Category</th>
                    <th>Count</th>
                    <th>Selected</th>
                    <th>Yield %</th>
                  </tr>
                </thead>
                <tbody>
                  ${leadRows}
                </tbody>
              </table>
            ` : `<p style="font-size: 0.8rem; color: #64748b; font-style: italic;">No lead generation mapping found.</p>`}
          </div>

          <div>
            <div class="section-title">Operational Task Auditing</div>
            <table style="margin-top: 10px;">
              <thead>
                <tr>
                  <th style="text-align: left;">Task Status Class</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: bold; text-align: left;">Total Assigned Tasks</td>
                  <td style="font-weight: 900; color: #6366f1;">${totalTasks}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; text-align: left;">Active / Pending Tasks</td>
                  <td style="font-weight: 900; color: #f59e0b;">${activeTasks}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; text-align: left;">Completed Tasks</td>
                  <td style="font-weight: 900; color: #10b981;">${completedTasks}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; text-align: left;">Overdue Tasks</td>
                  <td style="font-weight: 900; color: #ef4444;">${overdueTasks}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="section-title">Attendance Auditing Logs</div>
        ${attList.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">${firstColHeader}</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Work Hours</th>
                <th>Breaks</th>
                <th>Late In</th>
                <th>Late Out</th>
                <th>Efficiency Index</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceRows}
            </tbody>
          </table>
        ` : `<p style="font-size: 0.8rem; color: #64748b; font-style: italic;">No attendance punch logs mapped in this scope.</p>`}

        <div class="footer">
          <p>Fast RMS - Powered by Givyansh Group neural database services. CONFIDENTIAL AUDIT REPORT DOCUMENT.</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Clean all filters
  const resetFilters = () => {
    setDateMode("last_30");
    setStartDate("");
    setEndDate("");
    setSelectedManager("");
    setSelectedTL("");
    setSelectedRecruiter("");
    setSelectedClient("");
    setSelectedJob("");
    setSelectedVendor("");
    setSelectedSourcing("");
    setSelectedShift("");
    setSelectedTeam("");
    setActiveDrilldown(null);
    setSelectedRecruiterProfile(null);
    setSelectedTLProfile(null);
    setSelectedManagerProfile(null);
  };

  // Client-side CSV/Excel Generation Engine
  const triggerExport = (reportName: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => {
        const str = String(val === null || val === undefined ? "" : val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FastRMS_${reportName}_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleSuccess(true);
    setTimeout(() => {
      setScheduleSuccess(false);
      setShowScheduler(false);
    }, 2500);
  };

  if (loading && !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Reports...</span>
      </div>
    );
  }

  const {
    summary = {},
    recruitment = {},
    clients = [],
    jobs = [],
    sources = [],
    vendors = [],
    teams = [],
    attendance = [],
    dailyAttendance = [],
    leads = {},
    tasks = {},
    incentives = {},
    shifts = [],
    leaderboards = {},
    insights = [],
    trends = []
  } = data || {};

  const activeIndividual = 
    teams.find((x: any) => String(x.id) === String(selectedRecruiter)) ||
    teams.find((x: any) => String(x.id) === String(selectedTL)) ||
    teams.find((x: any) => String(x.id) === String(selectedManager));


  return (
    <div className="boss-reports-panel" style={{ background: "#f8fafc", minHeight: "100%", fontFamily: "Inter, sans-serif", padding: "16px" }}>
      
      {/* Dynamic Print/CSS Overrides */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .boss-reports-panel, .boss-reports-panel * { visibility: visible; }
          .boss-reports-panel { position: absolute; left: 0; top: 0; width: 100%; }
          .filter-card, .btn-primary, .export-center-card, .scheduler-modal { display: none !important; }
        }
        .telemetry-loader { position: relative; display: flex; align-items: center; justify-content: center; }
        .sonar-ring {
          position: absolute; width: 80px; height: 80px; border: 4px solid #6366f1; border-radius: 50%;
          animation: sonar 1.8s infinite ease-out; opacity: 0;
        }
        @keyframes sonar {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .metric-card {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px;
          box-shadow: 0 2px 4px -1px rgba(0,0,0,0.03); transition: all 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-1px); box-shadow: 0 4px 6px -2px rgba(0,0,0,0.05);
          border-color: #6366f1;
        }
        .glass-dark-metallic {
          background: linear-gradient(135deg, #0f172a, #1e293b); color: #ffffff;
          border: 1px solid #334155; box-shadow: 0 4px 10px -2px rgba(0,0,0,0.15);
        }
        .reports-grid-table {
          width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 4px;
        }
        .reports-grid-table th {
          background: #f1f5f9; padding: 4px 8px; font-weight: 800; text-transform: uppercase;
          font-size: 0.64rem; letter-spacing: 0.03em; color: #475569; text-align: left;
          border-bottom: 2px solid #e2e8f0;
        }
        .reports-grid-table td {
          padding: 4px 8px; border-bottom: 1px solid #f1f5f9; font-size: 0.72rem; color: #1e293b;
        }
        .reports-grid-table tbody tr:hover td {
          background: #f8fafc; cursor: pointer;
        }
        .badge-online { background: #dcfce7; color: #15803d; border-radius: 30px; padding: 1px 5px; font-size: 0.62rem; font-weight: 700; }
        .badge-break { background: #fef9c3; color: #a16207; border-radius: 30px; padding: 1px 5px; font-size: 0.62rem; font-weight: 700; }
        .badge-offline { background: #f1f5f9; color: #475569; border-radius: 30px; padding: 1px 5px; font-size: 0.62rem; font-weight: 700; }
        .filter-select {
          background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px;
          font-size: 0.74rem; color: #1e293b; font-weight: 600; width: 100%; outline: none; transition: border 0.2s;
        }
        .filter-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
      `}</style>

      {/* HEADER SECTION */}
      <div className="flex-between flex-wrap gap-small" style={{ marginBottom: "10px", alignItems: "center" }}>
        {/* Title Block */}
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#0f172a" }}>Executive </span>
            <span style={{ color: "#2563eb" }}>Command Suite</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Complete real-time corporate business intelligence and diagnostic matrix.</p>
        </div>

        {/* Center Sub-Tab Toggle */}
        <div style={{
          display: "flex",
          background: "#f1f5f9",
          padding: "4.5px",
          borderRadius: "12px",
          border: "1px solid #cbd5e1",
          gap: "4px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
        }}>
          <button
            onClick={() => setActiveReportSubTab("reports")}
            style={{
              padding: "8px 24px",
              borderRadius: "8px",
              border: "none",
              background: activeReportSubTab === "reports" ? "white" : "transparent",
              color: activeReportSubTab === "reports" ? "#2563eb" : "#64748b",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: activeReportSubTab === "reports" ? "0 2px 5px rgba(37, 99, 235, 0.05)" : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              whiteSpace: "nowrap"
            }}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveReportSubTab("analysis")}
            style={{
              padding: "8px 24px",
              borderRadius: "8px",
              border: "none",
              background: activeReportSubTab === "analysis" ? "white" : "transparent",
              color: activeReportSubTab === "analysis" ? "#2563eb" : "#64748b",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: activeReportSubTab === "analysis" ? "0 2px 5px rgba(37, 99, 235, 0.05)" : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              whiteSpace: "nowrap"
            }}
          >
            Analysis
          </button>
        </div>
        
        {/* ACTION PANEL */}
        <div style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "center", justifyContent: "flex-end" }}>
          <button onClick={() => setShowScheduler(true)} className="btn-secondary flex-center gap-small" style={{ borderRadius: "8px", padding: "4px 10px", fontSize: "0.74rem", display: "flex", alignItems: "center", gap: "4px" }}>
            <LucideCalendar size={12} /> Schedule Auto Reports
          </button>
        </div>
      </div>



      {/* TOP DYNAMIC COOPERATIVE FILTER BAR */}
      <div className="filter-card glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h3 style={{ margin: "0", fontSize: "0.85rem", fontWeight: 800, color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
            <LucideSliders size={14} color="#6366f1" /> Cooperative Operational Filters
          </h3>
          <button 
            onClick={resetFilters} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "4px", 
              fontSize: "0.72rem", 
              padding: "4px 10px", 
              borderRadius: "8px", 
              border: "1px solid #6366f1", 
              background: "rgba(99, 102, 241, 0.05)", 
              color: "#6366f1", 
              fontWeight: 800, 
              cursor: "pointer" 
            }}
          >
            <LucideRefreshCcw size={12} /> Reset Filters
          </button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "8px" }}>
          {/* Time range scope */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Temporal Scope</label>
            <select value={dateMode} onChange={(e) => setDateMode(e.target.value)} className="filter-select">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7">Last 7 Days</option>
              <option value="last_30">Last 30 Days</option>
              <option value="last_90">Last 90 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateMode === "custom" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="filter-select" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="filter-select" />
              </div>
            </>
          )}

          {/* Manager select */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Directing Manager</label>
            <select value={selectedManager} onChange={(e) => { setSelectedManager(e.target.value); setSelectedTL(""); setSelectedRecruiter(""); }} className="filter-select">
              <option value="">All Managers</option>
              {teams.filter((u: any) => u.role === "manager").map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* TL Select */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Team Leader</label>
            <select value={selectedTL} onChange={(e) => { setSelectedTL(e.target.value); setSelectedRecruiter(""); }} className="filter-select">
              <option value="">All Team Leads</option>
              {teams.filter((u: any) => u.role === "tl" && (!selectedManager || u.supervisor === teams.find((x: any) => x.id === parseInt(selectedManager))?.name)).map((tl: any) => (
                <option key={tl.id} value={tl.id}>{tl.name}</option>
              ))}
            </select>
          </div>

          {/* Recruiter select */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Recruitment Officer</label>
            <select value={selectedRecruiter} onChange={(e) => setSelectedRecruiter(e.target.value)} className="filter-select">
              <option value="">All Recruiters</option>
              {teams.filter((u: any) => u.role === "recruiter" && (!selectedTL || u.supervisor === teams.find((x: any) => x.id === parseInt(selectedTL))?.name)).map((r: any) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Client select */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Target Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="filter-select">
              <option value="">All Clients</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.clientName}>{c.clientName}</option>
              ))}
            </select>
          </div>

          {/* Job Select */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Job Mandate</label>
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="filter-select">
              <option value="">All Jobs</option>
              {jobs.map((j: any) => (
                <option key={j.id} value={j.jobTitle}>{j.jobTitle}</option>
              ))}
            </select>
          </div>

          {/* Vendor select */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Candidate Vendor</label>
            <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="filter-select">
              <option value="">All Vendors</option>
              {vendors.map((v: any) => (
                <option key={v.id} value={v.vendorName}>{v.vendorName}</option>
              ))}
            </select>
          </div>

          {/* Sourcing Channel select */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Sourcing Engine</label>
            <select value={selectedSourcing} onChange={(e) => setSelectedSourcing(e.target.value)} className="filter-select">
              <option value="">All Sourcing</option>
              {sources.map((s: any) => (
                <option key={s.sourceName} value={s.sourceName}>{s.sourceName}</option>
              ))}
            </select>
          </div>

          {/* Shift select */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "3px" }}>Work Shift</label>
            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="filter-select">
              <option value="">All Shifts</option>
              {shifts.map((s: any) => (
                <option key={s.id} value={s.id}>{s.shiftName}</option>
              ))}
            </select>
          </div>

          {activeIndividual && (
            <div style={{ display: "flex", alignItems: "flex-end", gridColumn: "span 2" }}>
              <button 
                onClick={() => handleDownloadFullReportPDF(activeIndividual)}
                style={{ 
                  width: "100%", 
                  height: "36px", 
                  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", 
                  color: "#ffffff", 
                  fontWeight: 900, 
                  fontSize: "0.78rem", 
                  border: "none", 
                  borderRadius: "8px", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "6px",
                  boxShadow: "0 4px 10px rgba(59, 130, 246, 0.15)",
                  transition: "all 0.2s ease"
                }}
              >
                <LucideDownload size={14} /> Download {activeIndividual.name} Full Report PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {activeReportSubTab === "analysis" ? (
        <>
          {/* MULTI-METRIC INTERACTIVE SVG TREND GRAPH */}
          <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px" }}>
        <div className="flex-between flex-wrap gap-small" style={{ marginBottom: "8px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 950, color: "#0f172a" }}>Organizational Telemetry & Growth Curves</h3>
            <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "1px 0 0" }}>Historical timeline tracing candidates generated, selection rates, and joining conversions.</p>
          </div>
          <div className="flex gap-small" style={{ fontSize: "0.72rem", fontWeight: 800 }}>
            <span style={{ color: "#6366f1", display: "flex", alignItems: "center", gap: "4px" }}><span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }}></span> Sourced</span>
            <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}><span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }}></span> Selections</span>
            <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}><span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span> Joined</span>
          </div>
        </div>

        {/* Clean SVG Canvas */}
        <div style={{ width: "100%", height: "140px", position: "relative" }}>
          {trends.length > 0 ? (
            <svg viewBox="0 0 700 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="glow-candidates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="glow-selections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="700" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="180" x2="700" y2="180" stroke="#cbd5e1" strokeWidth="1" />

              {/* Data curves rendering dynamically based on real trends */}
              {(() => {
                const maxVal = Math.max(10, ...trends.map((t: any) => Math.max(t.candidates || 0, t.selections || 0, t.joinings || 0)));
                const scale = (val: number) => 180 - (val / maxVal) * 140;
                
                const pointsC = trends.map((t: any, idx: number) => `${idx * 115},${scale(t.candidates || 0)}`).join(" ");
                const pointsS = trends.map((t: any, idx: number) => `${idx * 115},${scale(t.selections || 0)}`).join(" ");
                const pointsJ = trends.map((t: any, idx: number) => `${idx * 115},${scale(t.joinings || 0)}`).join(" ");

                return (
                  <>
                    {/* Area Gradients */}
                    <path d={`M0,180 L${pointsC} L690,180 Z`} fill="url(#glow-candidates)" />
                    <path d={`M0,180 L${pointsS} L690,180 Z`} fill="url(#glow-selections)" />

                    {/* Smooth Paths */}
                    <path d={`M0,${scale(trends[0]?.candidates || 0)} S` + pointsC.substring(pointsC.indexOf(" ") + 1)} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                    <path d={`M0,${scale(trends[0]?.selections || 0)} S` + pointsS.substring(pointsS.indexOf(" ") + 1)} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                    <path d={`M0,${scale(trends[0]?.joinings || 0)} S` + pointsJ.substring(pointsJ.indexOf(" ") + 1)} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

                    {/* Nodes and Ticks */}
                    {trends.map((t: any, idx: number) => {
                      const cx = idx * 115;
                      return (
                        <g key={idx}>
                          <circle cx={cx} cy={scale(t.candidates || 0)} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={cx} cy={scale(t.selections || 0)} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={cx} cy={scale(t.joinings || 0)} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                          <text x={cx} y="195" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="700">{t.date}</text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          ) : (
            <div className="flex-center" style={{ height: "100%", color: "#64748b" }}>Not enough timeline points loaded yet.</div>
          )}
        </div>
      </div>

      {/* DYNAMIC REAL-TIME AI DIAGNOSTIC INSIGHTS */}
      <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
          <LucideSparkles size={16} color="#6366f1" /> Real-time Corporate Intelligence (AI Engine)
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "8px" }}>
          {insights.map((ins: any, idx: number) => (
            <div key={idx} style={{
              background: ins.type === "success" ? "#f0fdf4" : ins.type === "info" ? "#eff6ff" : ins.type === "warning" ? "#fffbeb" : "#fef2f2",
              border: `1px solid ${ins.type === "success" ? "#bbf7d0" : ins.type === "info" ? "#bfdbfe" : ins.type === "warning" ? "#fde68a" : "#fca5a5"}`,
              borderRadius: "10px", padding: "8px 10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                {ins.type === "success" && <LucideShieldCheck size={14} color="#15803d" />}
                {ins.type === "info" && <LucideTrendingUp size={14} color="#1d4ed8" />}
                {ins.type === "warning" && <LucideAlertTriangle size={14} color="#b45309" />}
                {ins.type === "danger" && <LucideAlertTriangle size={14} color="#b91c1c" />}
                <strong style={{
                  fontSize: "0.74rem",
                  color: ins.type === "success" ? "#166534" : ins.type === "info" ? "#1e40af" : ins.type === "warning" ? "#854d0e" : "#991b1b",
                  textTransform: "uppercase", letterSpacing: "0.03em"
                }}>{ins.title}</strong>
              </div>
              <p style={{
                margin: 0, fontSize: "0.72rem", lineHeight: "1.3",
                color: ins.type === "success" ? "#14532d" : ins.type === "info" ? "#1e3a8a" : ins.type === "warning" ? "#713f12" : "#7f1d1d"
              }}>{ins.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NEW PREMIUM ANALYTICAL CHARTS AND GAUGES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px", marginBottom: "12px" }}>
        
        {/* Sourcing Engine Performance horizontal bar chart */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: 950, color: "#0f172a" }}>Sourcing Engine Efficiency</h3>
          <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "0 0 10px 0" }}>Volume and quality mapping of active candidate sourcing streams.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sources && sources.length > 0 ? (
              sources.slice(0, 5).map((src: any, idx: number) => {
                const maxGen = Math.max(1, ...sources.map((s: any) => s.candidatesGenerated || 0));
                const pctGen = Math.round(((src.candidatesGenerated || 0) / maxGen) * 100);
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.74rem" }}>
                      <span style={{ fontWeight: 800, color: "#1e293b" }}>{src.sourceName || "Direct / Unknown"}</span>
                      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                        <strong>{src.candidatesGenerated}</strong> generated • <strong style={{ color: "#2563eb" }}>{src.conversionRate}%</strong> joined
                      </span>
                    </div>
                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center" }}>
                      <div style={{
                        width: `${pctGen}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)`,
                        borderRadius: "6px"
                      }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "0.74rem" }}>No sourcing platforms data available.</div>
            )}
          </div>
        </div>

        {/* Client Placement contributions horizontal stacked bar chart */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: 950, color: "#0f172a" }}>Client Contribution Breakdown</h3>
          <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "0 0 10px 0" }}>Candidate conversions (Sourced vs Selected vs Joined) across top active client accounts.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {clients && clients.length > 0 ? (
              clients.slice(0, 4).map((cli: any, idx: number) => {
                const total = cli.totalCandidates || 0;
                const sel = cli.selected || 0;
                const join = cli.joined || 0;
                const other = Math.max(0, total - sel - join);
                
                const joinPct = total > 0 ? (join / total) * 100 : 0;
                const selPct = total > 0 ? (sel / total) * 100 : 0;
                const otherPct = total > 0 ? (other / total) * 100 : 0;
                
                return (
                  <div key={idx} style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", fontSize: "0.74rem" }}>
                      <span style={{ fontWeight: 900, color: "#1e293b" }}>{cli.clientName}</span>
                      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                        Total: <strong>{total}</strong> • Joined: <strong style={{ color: "#10b981" }}>{join}</strong>
                      </span>
                    </div>
                    <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
                      <div style={{ width: `${joinPct}%`, background: "#10b981" }} title={`Joined: ${join}`} />
                      <div style={{ width: `${selPct}%`, background: "#f59e0b" }} title={`Selected: ${sel}`} />
                      <div style={{ width: `${otherPct}%`, background: "#94a3b8" }} title={`Sourced/Other: ${other}`} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "0.6rem", fontWeight: 800 }}>
                      <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "3px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></span> Joined ({Math.round(joinPct)}%)</span>
                      <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "3px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }}></span> Selected ({Math.round(selPct)}%)</span>
                      <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#94a3b8" }}></span> Sourced ({Math.round(otherPct)}%)</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "0.74rem" }}>No active client metrics generated.</div>
            )}
          </div>
        </div>
      </div>

      {/* Ring Gauge Diagnostics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "12px" }}>
        
        {/* Attendance Compliance Gauge */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", textAlign: "center" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.76rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Attendance Compliance</h4>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", height: "90px" }}>
            <svg width="80" height="80" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${summary.attendanceCompliance || 100}, 100`} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", fontSize: "0.95rem", fontWeight: 900, color: "#0f172a" }}>{summary.attendanceCompliance}%</div>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.68rem", color: "#64748b" }}>Ratio of early check-in logs vs late desking entries.</p>
        </div>

        {/* Task Achievement Gauge */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", textAlign: "center" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.76rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Task Achievement</h4>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", height: "90px" }}>
            <svg width="80" height="80" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray={`${tasks.targetAchievement || 0}, 100`} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", fontSize: "0.95rem", fontWeight: 900, color: "#0f172a" }}>{tasks.targetAchievement}%</div>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.68rem", color: "#64748b" }}>Completed objectives against total allocated workflows.</p>
        </div>

        {/* Overall Joining Yield Gauge */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", textAlign: "center" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.76rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Overall Joining Yield</h4>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", height: "90px" }}>
            <svg width="80" height="80" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ec4899" strokeWidth="3" strokeDasharray={`${recruitment.overallConversion || 0}, 100`} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", fontSize: "0.95rem", fontWeight: 900, color: "#0f172a" }}>{recruitment.overallConversion}%</div>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.68rem", color: "#64748b" }}>Conversion rate from registrations to joined candidates.</p>
        </div>

      </div>
    </>
      ) : (
    <>
      {/* RECRUITMENT PIPELINE & INTERVIEW ROUNDS MERGED CARD */}
      <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px" }}>
        <div className="flex-between flex-wrap gap-small" style={{ marginBottom: "8px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => setPipelineRoundToggle("pipeline")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: pipelineRoundToggle === "pipeline" ? "#6366f1" : "transparent",
                  color: pipelineRoundToggle === "pipeline" ? "#ffffff" : "#475569",
                  transition: "all 0.2s"
                }}
              >
                Recruitment Conversion Pipeline
              </button>
              <button
                type="button"
                onClick={() => setPipelineRoundToggle("round")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: pipelineRoundToggle === "round" ? "#6366f1" : "transparent",
                  color: pipelineRoundToggle === "round" ? "#ffffff" : "#475569",
                  transition: "all 0.2s"
                }}
              >
                Interview Round Analytics
              </button>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (pipelineRoundToggle === "pipeline") {
                triggerExport("RecruitmentConversion", ["Metric", "Volume"], [
                  ["Registered Candidates", recruitment.regCandidates],
                  ["Connected Candidates", recruitment.connected],
                  ["Interested Candidates", recruitment.interested],
                  ["Processing For Interview", recruitment.processingForNextRound || 0],
                  ["Interview Done", recruitment.interviewDone || 0],
                  ["Interview Not Done", recruitment.interviewNotDone || 0],
                  ["Interviews Processed", recruitment.goForInterview],
                  ["Candidates Selected", recruitment.selected],
                  ["Onboarded/Joined", recruitment.joined],
                  ["Dropped Out", recruitment.dropped]
                ]);
              } else {
                triggerExport("InterviewRoundsAnalytics", ["Metric", "Volume"], [
                  ["Interview Done", recruitment.interviewDone || 0],
                  ["Interview Not Done", recruitment.interviewNotDone || 0],
                  ["Round 1 Cumulative", recruitment.r1Cumulative || 0],
                  ["Round 2 Cumulative", recruitment.r2Cumulative || 0],
                  ["Round 3 Cumulative", recruitment.r3Cumulative || 0],
                  ["Round 4 Cumulative", recruitment.r4Cumulative || 0],
                  ["Round 5 Cumulative", recruitment.r5Cumulative || 0],
                  ["All Rounds Done", recruitment.allRoundsCumulative || 0],
                  ["Processing For Next Round", recruitment.processingForNextRound || 0],
                  ["Interview Rescheduled", recruitment.interviewRescheduled || 0]
                ]);
              }
            }}
            className="btn-secondary flex-center gap-small"
            style={{ borderRadius: "8px", padding: "4px 8px", fontSize: "0.74rem" }}
          >
            {pipelineRoundToggle === "pipeline" ? (
              <><LucideDownload size={12} /> Export Funnel</>
            ) : (
              <><LucideDownload size={12} /> Export Rounds Report</>
            )}
          </button>
        </div>

        {pipelineRoundToggle === "pipeline" ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", textAlign: "center" }}>
              {[
                { label: "Registered Sourced", value: recruitment.regCandidates, sub: "Total base" },
                { label: "Connected", value: recruitment.connected, sub: `${recruitment.notConnected} unreached` },
                { label: "Interested Desk", value: recruitment.interested, sub: `${recruitment.notInterested} uninterested` },
                { label: "Processing For Interview", value: recruitment.processingForNextRound || 0, sub: `Active processing` },
                { label: "Interview Done", value: recruitment.interviewDone || 0, sub: `${recruitment.interviewNotDone || 0} not done` },
                { label: "Go For Interview", value: recruitment.goForInterview, sub: `${recruitment.callNotPick} missed calls` },
                { label: "Hired/Selected", value: recruitment.selected, sub: `${recruitment.rejected} rejected` },
                { label: "Onboarded & Joined", value: recruitment.joined, sub: `${recruitment.dropped} dropped` }
              ].map((item, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: "8px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "96px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "32px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", lineHeight: "1.15" }}>{item.label}</span>
                  </div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 950, color: "#0f172a", margin: "2px 0" }}>{item.value}</h2>
                  <span style={{ fontSize: "0.62rem", color: "#64748b" }}>{item.sub}</span>
                </div>
              ))}
            </div>

            <div className="p-medium" style={{ background: "#f8fafc", borderRadius: "10px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "10px", padding: "10px" }}>
              {[
                { label: "Connected → Interested", rate: recruitment.connectedToInterested, color: "#6366f1" },
                { label: "Interested → Interview", rate: recruitment.interestedToInterview, color: "#f59e0b" },
                { label: "Interview → Selected", rate: recruitment.interviewToSelected, color: "#10b981" },
                { label: "Selected → Joined", rate: recruitment.selectedToJoined, color: "#ec4899" },
                { label: "Overall Joining Ratio", rate: recruitment.overallConversion, color: "#0f172a" }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex-between mb-small" style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155" }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.color }}>{item.rate}%</span>
                  </div>
                  <div style={{ height: "5px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ width: `${item.rate}%`, height: "100%", background: item.color, borderRadius: "10px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", textAlign: "center", marginBottom: "8px" }}>
              {[
                { label: "Interview Done", value: recruitment.interviewDone || 0, color: "#10b981", sub: "Completed" },
                { label: "Interview Not Done", value: recruitment.interviewNotDone || 0, color: "#ef4444", sub: "Missed/Cancelled" },
                { label: "Processing Next", value: recruitment.processingForNextRound || 0, color: "#f59e0b", sub: "Waiting next round" },
                { label: "Interview Rescheduled", value: recruitment.interviewRescheduled || 0, color: "#6366f1", sub: "Scheduled later" },
                { label: "All Rounds Done", value: recruitment.allRoundsDone || 0, color: "#8b5cf6", sub: "Ready for joining" }
              ].map((item, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{item.label}</span>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 950, color: item.color, margin: "2px 0" }}>{item.value}</h2>
                  <span style={{ fontSize: "0.62rem", color: "#64748b" }}>{item.sub}</span>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#334155", margin: "6px 0 4px" }}>Round-wise Completion & Transition</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px", textAlign: "center", marginBottom: "8px" }}>
              {[
                { label: "Round 1 Done", value: recruitment.r1Cumulative || 0, sub: "Total R1" },
                { label: "Round 2 Done", value: recruitment.r2Cumulative || 0, sub: "Total R2" },
                { label: "Round 3 Done", value: recruitment.r3Cumulative || 0, sub: "Total R3" },
                { label: "Round 4 Done", value: recruitment.r4Cumulative || 0, sub: "Total R4" },
                { label: "Round 5 Done", value: recruitment.r5Cumulative || 0, sub: "Total R5" }
              ].map((item, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{item.label}</span>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 950, color: "#4f46e5", margin: "2px 0" }}>{item.value}</h2>
                  <span style={{ fontSize: "0.62rem", color: "#64748b" }}>{item.sub}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              {[
                { label: "Round 1 → Round 2", rate: recruitment.r1ToR2Rate || 0, color: "#6366f1" },
                { label: "Round 2 → Round 3", rate: recruitment.r2ToR3Rate || 0, color: "#3b82f6" },
                { label: "Round 3 → Round 4", rate: recruitment.r3ToR4Rate || 0, color: "#60a5fa" },
                { label: "Round 4 → Round 5", rate: recruitment.r4ToR5Rate || 0, color: "#93c5fd" },
                { label: "Round 5 → All Done", rate: recruitment.r5ToAllRate || 0, color: "#10b981" }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex-between mb-small" style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155" }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.color }}>{item.rate}% ({100 - item.rate}% drop)</span>
                  </div>
                  <div style={{ height: "5px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ width: `${item.rate}%`, height: "100%", background: item.color, borderRadius: "10px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CORE DATA GRIDS (CLIENTS & JOBS & VENDORS & SOURCE) */}
      <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "10px", marginBottom: "12px" }}>
        
        {/* CLIENT & JOB PERFORMANCE MERGED SUITE */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <div className="flex-between flex-wrap gap-small" style={{ marginBottom: "8px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
                <button
                  type="button"
                  onClick={() => setClientJobToggle("client")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    background: clientJobToggle === "client" ? "#6366f1" : "transparent",
                    color: clientJobToggle === "client" ? "#ffffff" : "#475569",
                    transition: "all 0.2s"
                  }}
                >
                  Client Performance
                </button>
                <button
                  type="button"
                  onClick={() => setClientJobToggle("job")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    background: clientJobToggle === "job" ? "#6366f1" : "transparent",
                    color: clientJobToggle === "job" ? "#ffffff" : "#475569",
                    transition: "all 0.2s"
                  }}
                >
                  Job Performance
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (clientJobToggle === "client") {
                  triggerExport("ClientPerformance", [
                    "Client Name", "Total Candidates", "Interested", "Selected", "Joined", "Conversion %"
                  ], clients.map((c: any) => [c.clientName, c.totalCandidates, c.interested, c.selected, c.joined, c.conversionRate]));
                } else {
                  triggerExport("JobPerformance", [
                    "Job Title", "Total Candidates", "Selected", "Joined", "Fulfillment Rate"
                  ], jobs.map((j: any) => [j.jobTitle, j.totalCandidates, j.selected, j.joined, j.joiningRatio]));
                }
              }}
              className="btn-secondary flex-center gap-small"
              style={{ borderRadius: "8px", padding: "4px 8px", fontSize: "0.74rem" }}
            >
              <LucideDownload size={12} /> Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "200px" }}>
            {clientJobToggle === "client" ? (
              <table className="reports-grid-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Sourced</th>
                    <th>Selected</th>
                    <th>Joined</th>
                    <th>Selection Ratio</th>
                    <th>Joining Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c: any, idx: number) => (
                    <tr key={idx} onClick={() => setActiveDrilldown({ type: "client", id: c.id, name: c.clientName })}>
                      <td><strong>{c.clientName}</strong></td>
                      <td>{c.totalCandidates}</td>
                      <td style={{ color: "#f59e0b", fontWeight: 800 }}>{c.selected}</td>
                      <td style={{ color: "#10b981", fontWeight: 800 }}>{c.joined}</td>
                      <td>{c.selectionRatio}%</td>
                      <td><span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "6px", fontWeight: 800 }}>{c.joiningRatio}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="reports-grid-table">
                <thead>
                  <tr>
                    <th>Job Designation</th>
                    <th>Candidates Sourced</th>
                    <th>Selected</th>
                    <th>Joined</th>
                    <th>Time To Fill</th>
                    <th>Fulfillment Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j: any, idx: number) => (
                    <tr key={idx} onClick={() => setActiveDrilldown({ type: "job", id: j.id, name: j.jobTitle })}>
                      <td><strong>{j.jobTitle}</strong></td>
                      <td>{j.totalCandidates}</td>
                      <td style={{ color: "#f59e0b", fontWeight: 800 }}>{j.selected}</td>
                      <td style={{ color: "#10b981", fontWeight: 800 }}>{j.joined}</td>
                      <td>{j.timeToFill}</td>
                      <td><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "6px", fontWeight: 800 }}>{j.joiningRatio}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* VENDOR & SOURCING PLATFORMS GRID */}
      <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "10px", marginBottom: "12px" }}>
        
        {/* VENDOR AUDIT PANELS */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <div className="flex-between flex-wrap gap-small" style={{ marginBottom: "6px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#0f172a" }}>Vendor Share & Success Ratio</h3>
              <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "1px 0 0" }}>Track external vendor candidate volumes, selections & final joining payouts.</p>
            </div>
            <button onClick={() => triggerExport("VendorPerformance", [
              "Vendor Name", "Candidates Shared", "Selected", "Joined", "Success Ratio"
            ], vendors.map((v: any) => [v.vendorName, v.candidatesShared, v.selected, v.joined, v.successRatio]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "8px", padding: "4px 8px", fontSize: "0.74rem" }}>
              <LucideDownload size={12} /> Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "200px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Vendor Partner</th>
                  <th>Shared base</th>
                  <th>Sought Interviews</th>
                  <th>Selected</th>
                  <th>Joined</th>
                  <th>Success Rating</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v: any, idx: number) => (
                  <tr key={idx} onClick={() => setActiveDrilldown({ type: "vendor", id: v.id, name: v.vendorName })}>
                    <td><strong>{v.vendorName}</strong></td>
                    <td>{v.candidatesShared}</td>
                    <td>{v.interview}</td>
                    <td style={{ color: "#f59e0b", fontWeight: 800 }}>{v.selected}</td>
                    <td style={{ color: "#10b981", fontWeight: 800 }}>{v.joined}</td>
                    <td><span style={{ background: "#faf5ff", color: "#6b21a8", padding: "2px 6px", borderRadius: "6px", fontWeight: 800 }}>{v.successRatio}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SOURCING PLATFORMS QUALITY RATING */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <div className="flex-between flex-wrap gap-small" style={{ marginBottom: "6px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#0f172a" }}>Sourcing Engine Audit</h3>
              <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "1px 0 0" }}>Map yield metrics & overall candidate quality rating of digital platforms.</p>
            </div>
            <button onClick={() => triggerExport("SourcingPerformance", [
              "Sourcing Engine", "Sourced Count", "Selected", "Joined", "Quality Score"
            ], sources.map((s: any) => [s.sourceName, s.candidatesGenerated, s.selected, s.joined, s.sourceQualityScore]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "8px", padding: "4px 8px", fontSize: "0.74rem" }}>
              <LucideDownload size={12} /> Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "200px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Sourcing Engine</th>
                  <th>Generated</th>
                  <th>Selected</th>
                  <th>Joined</th>
                  <th>Yield Rate</th>
                  <th>Platform Quality Score</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s: any, idx: number) => (
                  <tr key={idx}>
                    <td><strong>{s.sourceName}</strong></td>
                    <td>{s.candidatesGenerated}</td>
                    <td>{s.selected}</td>
                    <td>{s.joined}</td>
                    <td>{s.conversionRate}%</td>
                    <td>
                      <div className="flex-center gap-small">
                        <div style={{ width: "50px", height: "4px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                          <div style={{ width: `${s.sourceQualityScore}%`, height: "100%", background: s.sourceQualityScore >= 75 ? "#10b981" : s.sourceQualityScore >= 45 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569" }}>{s.sourceQualityScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* LEAD DATA & TASK PERFORMANCE METRICS */}
      <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "10px", marginBottom: "12px" }}>
        
        {/* LEAD INTEL DATA */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <div className="flex-between flex-wrap gap-small" style={{ marginBottom: "6px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#0f172a" }}>Enterprise Lead Bank Overview</h3>
              <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "1px 0 0" }}>Breakdown analysis & conversion yield rates by industry categories.</p>
            </div>
            <button onClick={() => triggerExport("LeadAnalytics", [
              "Category", "Leads Generated", "Selections"
            ], leads.categoryBreakdown?.map((c: any) => [c.category, c.count, c.conversion]) || [])} className="btn-secondary flex-center gap-small" style={{ borderRadius: "8px", padding: "4px 8px", fontSize: "0.74rem" }}>
              <LucideDownload size={12} /> Export CSV
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
            <div style={{ background: "#f8fafc", padding: "6px 10px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Total Corporate Leads</span>
              <h2 style={{ fontSize: "1.3rem", margin: "2px 0 0", color: "#6366f1", fontWeight: 900 }}>{leads.totalLeads}</h2>
            </div>
            <div style={{ background: "#f8fafc", padding: "6px 10px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Converted Leads</span>
              <h2 style={{ fontSize: "1.3rem", margin: "2px 0 0", color: "#10b981", fontWeight: 900 }}>{leads.leadConversion}</h2>
            </div>
          </div>

          <div style={{ overflowY: "auto", maxHeight: "150px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Leads Generated</th>
                  <th>Selections</th>
                  <th>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {leads.categoryBreakdown?.map((c: any, idx: number) => (
                  <tr key={idx}>
                    <td><strong>{c.category}</strong></td>
                    <td>{c.count}</td>
                    <td style={{ color: "#f59e0b", fontWeight: 800 }}>{c.conversion}</td>
                    <td><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "6px", fontWeight: 800 }}>{c.count > 0 ? Math.round((c.conversion / c.count) * 100) : 0}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TASK COMPLETION VELOCITY */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "0.85rem", fontWeight: 900, color: "#0f172a" }}>Task Execution & Achievement %</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "8px" }}>
            <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Assigned Tasks</span>
              <h2 style={{ fontSize: "1.3rem", margin: "2px 0 0", color: "#0f172a", fontWeight: 900 }}>{tasks.assignedTasks}</h2>
            </div>
            <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Completed</span>
              <h2 style={{ fontSize: "1.3rem", margin: "2px 0 0", color: "#10b981", fontWeight: 900 }}>{tasks.completedTasks}</h2>
            </div>
            <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b" }}>Overdue</span>
              <h2 style={{ fontSize: "1.3rem", margin: "2px 0 0", color: "#ef4444", fontWeight: 900 }}>{tasks.expiredTasks}</h2>
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <div className="flex-between mb-small" style={{ fontSize: "0.74rem", fontWeight: 800 }}>
              <span>Target Achievement Rating</span>
              <span style={{ color: "#6366f1" }}>{tasks.targetAchievement}%</span>
            </div>
            <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" }}>
              <div style={{ width: `${tasks.targetAchievement}%`, height: "100%", background: "#6366f1" }} />
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b", lineHeight: "1.3" }}>
              Our organization has completed <strong>{tasks.completedTasks} tasks</strong> out of {tasks.assignedTasks} active targets this period. Avg speed: <strong>4.6 hr</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* SHIFT COVERAGE & TEAM PERFORMANCES */}
      <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "10px", marginBottom: "12px" }}>
        
        {/* SHIFT TELEMETRY MONITOR */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "0.85rem", fontWeight: 900, color: "#0f172a" }}>Operational Shift Telemetry</h3>
          
          <div style={{ overflowX: "auto", maxHeight: "200px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Shift Name</th>
                  <th>Assigned Base</th>
                  <th>Avg Working Hours</th>
                  <th>Avg Break Time</th>
                  <th>Shift Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((sh: any, idx: number) => (
                  <tr key={idx}>
                    <td><strong>{sh.shiftName}</strong></td>
                    <td>{sh.assignedEmployees} staff</td>
                    <td>{sh.avgWorkingHours}</td>
                    <td>{sh.avgBreakTime}</td>
                    <td>
                      <span style={{
                        background: sh.efficiency >= 80 ? "#dcfce7" : sh.efficiency >= 50 ? "#fef9c3" : "#fef2f2",
                        color: sh.efficiency >= 80 ? "#15803d" : sh.efficiency >= 50 ? "#a16207" : "#b91c1c",
                        padding: "2px 6px", borderRadius: "6px", fontWeight: 800, fontSize: "0.72rem"
                      }}>{sh.efficiency}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TEAM HIERARCHY SCORECARD */}
        <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px" }}>
          <div className="flex-between flex-wrap gap-small" style={{ marginBottom: "6px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900, color: "#0f172a" }}>Department Performance Scorecard</h3>
              <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "1px 0 0" }}>Corporate scores calculated based on selections, registrations & task completion.</p>
            </div>
            <button onClick={() => triggerExport("TeamScorecard", [
              "Name", "Role", "Registrations", "Selections", "Joined", "Performance Score"
            ], teams.map((t: any) => [t.name, t.role, t.registrations, t.selected, t.joined, t.performanceScore]))} className="btn-secondary flex-center gap-small" style={{ borderRadius: "8px", padding: "4px 8px", fontSize: "0.74rem" }}>
              <LucideDownload size={12} /> Export CSV
            </button>
          </div>

          <div style={{ overflowY: "auto", maxHeight: "200px" }}>
            <table className="reports-grid-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Role</th>
                  <th>Selections</th>
                  <th>Joinings</th>
                  <th>Task Comp</th>
                  <th>Index Score</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t: any, idx: number) => (
                  <tr key={idx} onClick={() => {
                    if (t.role === "recruiter") setSelectedRecruiterProfile(t);
                    else if (t.role === "tl") setSelectedTLProfile(t);
                    else if (t.role === "manager") setSelectedManagerProfile(t);
                  }}>
                    <td><strong>{t.name}</strong></td>
                    <td><span style={{ textTransform: "uppercase", fontSize: "0.68rem", fontWeight: 800, color: "#475569" }}>{t.role}</span></td>
                    <td style={{ color: "#f59e0b", fontWeight: 800 }}>{t.selected}</td>
                    <td style={{ color: "#10b981", fontWeight: 800 }}>{t.joined}</td>
                    <td>{t.tasksCompleted}</td>
                    <td>
                      <span style={{
                        background: t.performanceScore >= 75 ? "#dcfce7" : t.performanceScore >= 45 ? "#eff6ff" : "#fef2f2",
                        color: t.performanceScore >= 75 ? "#15803d" : t.performanceScore >= 45 ? "#1d4ed8" : "#ef4444",
                        padding: "2px 6px", borderRadius: "6px", fontWeight: 800, fontSize: "0.72rem"
                      }}>{t.performanceScore}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. LEADERBOARD SECTION (PODIUM PLAYERS STYLE) */}
      <div className="glass-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "8px", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 950, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
            <LucideAward size={16} color="#6366f1" /> TOP PERFORMERS
          </h3>
          
          {/* Role select toggle buttons */}
          <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
            {[
              { id: "recruiter", label: "Recruiter" },
              { id: "tl", label: "TL" },
              { id: "manager", label: "Manager" }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setLeaderboardRole(r.id as any);
                  setShowAllLeaderboard(false);
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: leaderboardRole === r.id ? "#6366f1" : "transparent",
                  color: leaderboardRole === r.id ? "#ffffff" : "#475569",
                  transition: "all 0.2s"
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric sub-tabs select */}
        <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "16px" }}>
          {[
            { id: "productivity", label: "Productivity" },
            { id: "sourced", label: "Sourced" },
            { id: "selected", label: "Selected" },
            { id: "joined", label: "Joined" }
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setLeaderboardMetric(m.id as any);
                setShowAllLeaderboard(false);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "0.74rem",
                fontWeight: 800,
                color: leaderboardMetric === m.id ? "#6366f1" : "#64748b",
                cursor: "pointer",
                padding: "2px 0 6px 0",
                position: "relative",
                borderBottom: leaderboardMetric === m.id ? "2px solid #6366f1" : "2px solid transparent",
                transition: "all 0.2s"
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Podium Top 3 Render */}
        {sortedLeaderboardList.length > 0 ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr 1fr", gap: "10px", alignItems: "flex-end", margin: "16px 0" }}>
              
              {/* Rank 2 (Left side) */}
              {sortedLeaderboardList[1] ? (
                <div 
                  onClick={() => {
                    const t = sortedLeaderboardList[1];
                    if (t.role === "recruiter") setSelectedRecruiterProfile(t);
                    else if (t.role === "tl") setSelectedTLProfile(t);
                    else if (t.role === "manager") setSelectedManagerProfile(t);
                  }}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "12px 8px",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    cursor: "pointer"
                  }}
                >
                  <span style={{
                    width: "20px", height: "20px", background: "#94a3b8", color: "#ffffff",
                    borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                    position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
                    fontSize: "0.7rem", fontWeight: 800
                  }}>2</span>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #94a3b8",
                    background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "6px auto 4px", fontSize: "0.85rem", fontWeight: 900, color: "#475569"
                  }}>
                    {typeof sortedLeaderboardList[1].name === "string" && sortedLeaderboardList[1].name.length > 0
                      ? sortedLeaderboardList[1].name.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#1e293b", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {sortedLeaderboardList[1].name}
                  </h4>
                  <span style={{ fontSize: "0.62rem", color: "#64748b" }}>
                    {sortedLeaderboardList[1].supervisor || "General Shift"}
                  </span>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: "4px 0 0" }}>
                    {leaderboardMetric === "productivity" ? `${sortedLeaderboardList[1].performanceScore}%` :
                     leaderboardMetric === "sourced" ? sortedLeaderboardList[1].registrations :
                     leaderboardMetric === "selected" ? sortedLeaderboardList[1].selected :
                     sortedLeaderboardList[1].joined}
                  </h2>
                  <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    {leaderboardMetric}
                  </span>
                </div>
              ) : <div />}

              {/* Rank 1 (Center) */}
              {sortedLeaderboardList[0] ? (
                <div 
                  onClick={() => {
                    const t = sortedLeaderboardList[0];
                    if (t.role === "recruiter") setSelectedRecruiterProfile(t);
                    else if (t.role === "tl") setSelectedTLProfile(t);
                    else if (t.role === "manager") setSelectedManagerProfile(t);
                  }}
                  style={{
                    background: "#fffbeb",
                    border: "1.5px solid #fbbf24",
                    borderRadius: "12px",
                    padding: "16px 8px",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: "0 4px 10px rgba(251, 191, 36, 0.15)",
                    cursor: "pointer"
                  }}
                >
                  <span style={{
                    width: "22px", height: "22px", background: "#fbbf24", color: "#0f172a",
                    borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                    position: "absolute", top: "-11px", left: "50%", transform: "translateX(-50%)",
                    fontSize: "0.75rem", fontWeight: 900
                  }}>1</span>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #fbbf24",
                    background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "6px auto 4px", fontSize: "0.95rem", fontWeight: 950, color: "#d97706"
                  }}>
                    {typeof sortedLeaderboardList[0].name === "string" && sortedLeaderboardList[0].name.length > 0
                      ? sortedLeaderboardList[0].name.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 900, color: "#1e293b", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {sortedLeaderboardList[0].name}
                  </h4>
                  <span style={{ fontSize: "0.64rem", color: "#64748b" }}>
                    {sortedLeaderboardList[0].supervisor || "General Shift"}
                  </span>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 950, color: "#b45309", margin: "4px 0 0" }}>
                    {leaderboardMetric === "productivity" ? `${sortedLeaderboardList[0].performanceScore}%` :
                     leaderboardMetric === "sourced" ? sortedLeaderboardList[0].registrations :
                     leaderboardMetric === "selected" ? sortedLeaderboardList[0].selected :
                     sortedLeaderboardList[0].joined}
                  </h2>
                  <span style={{ fontSize: "0.6rem", color: "#b45309", fontWeight: 800, textTransform: "uppercase" }}>
                    {leaderboardMetric}
                  </span>
                </div>
              ) : <div />}

              {/* Rank 3 (Right side) */}
              {sortedLeaderboardList[2] ? (
                <div 
                  onClick={() => {
                    const t = sortedLeaderboardList[2];
                    if (t.role === "recruiter") setSelectedRecruiterProfile(t);
                    else if (t.role === "tl") setSelectedTLProfile(t);
                    else if (t.role === "manager") setSelectedManagerProfile(t);
                  }}
                  style={{
                    background: "#fff7ed",
                    border: "1px solid #ea580c",
                    borderRadius: "12px",
                    padding: "10px 8px",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    cursor: "pointer"
                  }}
                >
                  <span style={{
                    width: "20px", height: "20px", background: "#ea580c", color: "#ffffff",
                    borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                    position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
                    fontSize: "0.7rem", fontWeight: 800
                  }}>3</span>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #ea580c",
                    background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "6px auto 4px", fontSize: "0.85rem", fontWeight: 900, color: "#c2410c"
                  }}>
                    {typeof sortedLeaderboardList[2].name === "string" && sortedLeaderboardList[2].name.length > 0
                      ? sortedLeaderboardList[2].name.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#1e293b", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {sortedLeaderboardList[2].name}
                  </h4>
                  <span style={{ fontSize: "0.62rem", color: "#64748b" }}>
                    {sortedLeaderboardList[2].supervisor || "General Shift"}
                  </span>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: "4px 0 0" }}>
                    {leaderboardMetric === "productivity" ? `${sortedLeaderboardList[2].performanceScore}%` :
                     leaderboardMetric === "sourced" ? sortedLeaderboardList[2].registrations :
                     leaderboardMetric === "selected" ? sortedLeaderboardList[2].selected :
                     sortedLeaderboardList[2].joined}
                  </h2>
                  <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    {leaderboardMetric}
                  </span>
                </div>
              ) : <div />}

            </div>

            {/* List for Rank 4 onwards */}
            {sortedLeaderboardList.length > 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
                {(showAllLeaderboard ? sortedLeaderboardList.slice(3) : sortedLeaderboardList.slice(3, 5)).map((item: any, index: number) => {
                  const rankNum = index + 4;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.role === "recruiter") setSelectedRecruiterProfile(item);
                        else if (item.role === "tl") setSelectedTLProfile(item);
                        else if (item.role === "manager") setSelectedManagerProfile(item);
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          width: "20px", height: "20px", borderRadius: "50%", background: "#e2e8f0",
                          color: "#475569", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.7rem", fontWeight: 800
                        }}>{rankNum}</span>
                        <div>
                          <strong style={{ fontSize: "0.76rem", color: "#1e293b" }}>{item.name}</strong>
                          <span style={{ fontSize: "0.66rem", color: "#64748b", marginLeft: "8px" }}>
                            {item.supervisor || "General Shift"}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#10b981" }}>
                        {leaderboardMetric === "productivity" ? `${item.performanceScore}% Productivity` :
                         leaderboardMetric === "sourced" ? `${item.registrations} Sourced` :
                         leaderboardMetric === "selected" ? `${item.selected} Selected` :
                         `${item.joined} Joined`}
                      </span>
                    </div>
                  );
                })}

                {/* View Full Leaderboard Toggle */}
                {sortedLeaderboardList.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#eff6ff",
                      border: "none",
                      borderRadius: "8px",
                      color: "#2563eb",
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px"
                    }}
                  >
                    {showAllLeaderboard ? "Show Less" : "View Full Leaderboard"} <LucideChevronRight size={14} style={{ transform: showAllLeaderboard ? "rotate(-90deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "0.78rem" }}>
            No performance metrics generated for this role.
          </div>
        )}
      </div>
    </>
      )}

      {/* SCHEDULED AUTOMATED REPORTS MODAL */}
      <AnimatePresence>
        {showScheduler && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "480px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Schedule Auto Intelligence Reports</h3>
                <button onClick={() => setShowScheduler(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <form onSubmit={handleScheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Delivery Frequency</label>
                  <select value={scheduleFreq} onChange={(e) => setScheduleFreq(e.target.value)} className="filter-select">
                    <option value="daily">Daily Briefing (08:00 AM)</option>
                    <option value="weekly">Weekly Operational Review (Mondays)</option>
                    <option value="monthly">Monthly CEO Payout Sheet (1st Day)</option>
                    <option value="quarterly">Quarterly Corporate Telemetry</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Delivery Modules</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "5px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={deliveryChannel.inbox} onChange={(e) => setDeliveryChannel({ ...deliveryChannel, inbox: e.target.checked })} />
                      Deliver to CEO Inbox Module
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={deliveryChannel.gmail} onChange={(e) => setDeliveryChannel({ ...deliveryChannel, gmail: e.target.checked })} />
                      Deliver to Corporate Gmail Integration
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={deliveryChannel.hostinger} onChange={(e) => setDeliveryChannel({ ...deliveryChannel, hostinger: e.target.checked })} />
                      Deliver to Hostinger Webmail Integration
                    </label>
                  </div>
                </div>

                {scheduleSuccess ? (
                  <div style={{ background: "#f0fdf4", color: "#166534", padding: "12px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, textAlign: "center" }}>
                    Success! Automated reporting pipeline mapped.
                  </div>
                ) : (
                  <button type="submit" className="btn-primary w-full" style={{ padding: "12px", borderRadius: "12px" }}>Initialize Automated Dispatcher</button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRILLDOWN DETAIL MODAL */}
      <AnimatePresence>
        {activeDrilldown && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "800px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Detailed telemetry: {activeDrilldown.name}</h3>
                <button onClick={() => setActiveDrilldown(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <div style={{ overflowX: "auto", maxHeight: "400px" }}>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "15px" }}>Real-time listing of candidate files mapped under this active operational record.</p>
                <table className="reports-grid-table">
                  <thead>
                    <tr>
                      <th>Candidate File</th>
                      <th>Phone</th>
                      <th>Assigned Recruiter</th>
                      <th>Status Mark</th>
                      <th>Remarks Details</th>
                      <th>Sourcing Sourced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingDrilldown ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontWeight: 700 }}>
                          <LucideActivity size={24} className="animate-spin" color="#6366f1" style={{ margin: "0 auto 8px" }} />
                          Fetching Candidates Telemetry...
                        </td>
                      </tr>
                    ) : drilldownCandidates.length > 0 ? (
                      drilldownCandidates.map((cand, idx) => {
                        const recruiterName = cand.recruiterName || teams.find((t: any) => t.id === cand.assignedTo || t.id === cand.addedBy)?.name || "N/A";
                        return (
                          <tr key={idx}>
                            <td><strong>{cand.name || "N/A"}</strong></td>
                            <td>{cand.phone || "N/A"}</td>
                            <td>{recruiterName}</td>
                            <td><span className="badge-online">{cand.status || "New"}</span></td>
                            <td>{cand.remarks || "No remarks details."}</td>
                            <td><span className="badge-offline">{cand.sourcingBy || "Direct"}</span></td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                          No candidate files mapped under this specific filter boundary.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECRUITER DRILLDOWN DOSSIER */}
      <AnimatePresence>
        {selectedRecruiterProfile && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "700px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Recruiter Intelligence Dossier</h3>
                <button onClick={() => setSelectedRecruiterProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#6366f1", color: "#ffffff", fontSize: "2rem", fontWeight: 900 }} className="flex-center">
                  {selectedRecruiterProfile.name[0]}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 900 }}>{selectedRecruiterProfile.name}</h2>
                  <p style={{ color: "#64748b", margin: "2px 0" }}>Recruiter • Mapped under Team Leader: <strong>{selectedRecruiterProfile.supervisor}</strong></p>
                  <span className="badge-online">Active Desk</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Registrations Sourced</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#6366f1" }}>{selectedRecruiterProfile.registrations}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Selections Made</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#f59e0b" }}>{selectedRecruiterProfile.selected}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Onboarded & Joined</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#10b981" }}>{selectedRecruiterProfile.joined}</h3>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Workstation Metrics Summary</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "0.85rem" }}>
                  <div>Leads Generated: <strong>{selectedRecruiterProfile.leadsGenerated} leads</strong></div>
                  <div>Targets Accomplished: <strong>{selectedRecruiterProfile.tasksCompleted} tasks completed</strong></div>
                  <div>Directing Rank Position: <strong>#{selectedRecruiterProfile.ranking} Recruiter</strong></div>
                  <div>Performance Quotient Score: <strong style={{ color: "#10b981" }}>{selectedRecruiterProfile.performanceScore}% Yield</strong></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEAM LEADER DRILLDOWN DOSSIER */}
      <AnimatePresence>
        {selectedTLProfile && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "700px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Team Leader Intelligence Dossier</h3>
                <button onClick={() => setSelectedTLProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f59e0b", color: "#ffffff", fontSize: "2rem", fontWeight: 900 }} className="flex-center">
                  {selectedTLProfile.name[0]}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 900 }}>{selectedTLProfile.name}</h2>
                  <p style={{ color: "#64748b", margin: "2px 0" }}>Team Lead • Direct Supervisor: <strong>{selectedTLProfile.supervisor}</strong></p>
                  <span className="badge-online">Active Lead Node</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Sourced</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#6366f1" }}>{selectedTLProfile.registrations}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Selections</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#f59e0b" }}>{selectedTLProfile.selected}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Joined</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#10b981" }}>{selectedTLProfile.joined}</h3>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Department Breakdown Metrics</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "0.85rem" }}>
                  <div>Division Leads Sourced: <strong>{selectedTLProfile.leadsGenerated} leads</strong></div>
                  <div>Targets Accomplished: <strong>{selectedTLProfile.tasksCompleted} tasks completed</strong></div>
                  <div>Active TL Leaderboard Position: <strong>#{selectedTLProfile.ranking} Lead Node</strong></div>
                  <div>Cumulative Performance index: <strong style={{ color: "#10b981" }}>{selectedTLProfile.performanceScore}% Yield</strong></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGER DRILLDOWN DOSSIER */}
      <AnimatePresence>
        {selectedManagerProfile && (
          <div className="scheduler-modal flex-center" style={{
            position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
            background: "rgba(15,23,42,0.6)", zIndex: 1000, padding: "20px"
          }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#ffffff", padding: "2rem", borderRadius: "24px", width: "100%", maxWidth: "700px", border: "1px solid #cbd5e1" }}>
              
              <div className="flex-between mb-medium">
                <h3 style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>Manager Intelligence Dossier</h3>
                <button onClick={() => setSelectedManagerProfile(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideX size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#0f172a", color: "#ffffff", fontSize: "2rem", fontWeight: 900 }} className="flex-center">
                  {selectedManagerProfile.name[0]}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 900 }}>{selectedManagerProfile.name}</h2>
                  <p style={{ color: "#64748b", margin: "2px 0" }}>Directing Manager • Mapped under CEO / Boss Control</p>
                  <span className="badge-online">Active Exec Node</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Sourced</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#6366f1" }}>{selectedManagerProfile.registrations}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Selections</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#f59e0b" }}>{selectedManagerProfile.selected}</h3>
                </div>
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Division Joined</span>
                  <h3 style={{ fontSize: "1.5rem", margin: "5px 0 0", color: "#10b981" }}>{selectedManagerProfile.joined}</h3>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Department Strategic Metrics</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "0.85rem" }}>
                  <div>Division Leads Sourced: <strong>{selectedManagerProfile.leadsGenerated} leads</strong></div>
                  <div>Targets Accomplished: <strong>{selectedManagerProfile.tasksCompleted} tasks completed</strong></div>
                  <div>Directing Rank: <strong>#{selectedManagerProfile.ranking} Manager</strong></div>
                  <div>Department Performance quotient: <strong style={{ color: "#10b981" }}>{selectedManagerProfile.performanceScore}% Yield</strong></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
