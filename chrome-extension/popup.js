/**
 * Fast RMS AI Sourcing Companion
 * Popup logic for fetching, compiling reports, filtering, and injecting.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const recruiterSelect = document.getElementById('recruiterSelect');
  const dateSelect = document.getElementById('dateSelect');
  const reportPreview = document.getElementById('reportPreview');
  const loaderOverlay = document.getElementById('loaderOverlay');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  // Interactive Controls
  const tabButtons = document.querySelectorAll('.tab-btn');
  const formatButtons = document.querySelectorAll('.tone-btn');
  const refreshBtn = document.getElementById('refreshBtn');
  const copyBtn = document.getElementById('copyBtn');
  const injectBtn = document.getElementById('injectBtn');

  // Application State
  let candidatesData = [];
  let currentTab = 'sourcing'; // sourcing, grid, kpi
  let currentFormat = 'professional'; // professional, markdown
  let isConnected = false;

  // CRM API Endpoints to check (handles both frontend proxy and direct backend port)
  const API_ENDPOINTS = [
    'http://localhost:5173/api/candidates',
    'http://localhost:5000/api/candidates'
  ];

  // Initialize
  init();

  function init() {
    // Tab switching
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');
        generateReport();
      });
    });

    // Format switching
    formatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        formatButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFormat = btn.getAttribute('data-format');
        generateReport();
      });
    });

    // Filter changes
    recruiterSelect.addEventListener('change', generateReport);
    dateSelect.addEventListener('change', generateReport);

    // Button actions
    refreshBtn.addEventListener('click', fetchData);
    copyBtn.addEventListener('click', copyToClipboard);
    injectBtn.addEventListener('click', injectIntoEmail);

    // Initial data fetch
    fetchData();
  }

  // Fetch candidate data from CRM API
  async function fetchData() {
    setLoader(true);
    updateStatus('connecting');
    reportPreview.value = 'Connecting to CRM database...';

    let success = false;
    let fetchedData = [];

    // Try endpoints sequentially
    for (const url of API_ENDPOINTS) {
      try {
        console.log(`Attempting CRM Fetch: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // Send cookies so that express authenticate middleware parses user session automatically
          credentials: 'include' 
        });

        if (response.ok) {
          fetchedData = await response.json();
          success = true;
          console.log(`Successfully connected and fetched from: ${url}`, fetchedData);
          break;
        } else {
          console.warn(`Failed response from ${url}: Status ${response.status}`);
        }
      } catch (err) {
        console.error(`Error connecting to ${url}:`, err);
      }
    }

    setLoader(false);

    if (success && Array.isArray(fetchedData)) {
      candidatesData = fetchedData;
      isConnected = true;
      updateStatus('connected');
      populateRecruiters();
      generateReport();
      showToast('Synced live data from CRM!');
    } else {
      candidatesData = [];
      isConnected = false;
      updateStatus('disconnected');
      reportPreview.value = '🔴 OFFLINE: Unable to reach Givyansh CRM backend.\n\n' +
        'Please ensure:\n' +
        '1. Givyansh CRM project is running locally.\n' +
        '2. You are logged into http://localhost:5173 in this browser.\n' +
        '3. Refresh by clicking the "Sync" button below.';
    }
  }

  // Set Loader Visibility
  function setLoader(show) {
    if (show) {
      loaderOverlay.classList.add('active');
    } else {
      loaderOverlay.classList.remove('active');
    }
  }

  // Update Online Status UI
  function updateStatus(status) {
    statusDot.className = 'status-dot';
    if (status === 'connected') {
      statusDot.classList.add('pulsing-green');
      statusText.textContent = 'CRM Connected';
      statusText.style.color = 'var(--accent-emerald)';
    } else if (status === 'connecting') {
      statusDot.classList.add('pulsing-red');
      statusText.textContent = 'Syncing...';
      statusText.style.color = 'var(--text-secondary)';
    } else {
      statusDot.classList.add('pulsing-red');
      statusText.textContent = 'Offline';
      statusText.style.color = 'var(--accent-rose)';
    }
  }

  // Populate Recruiters dropdown filter from data
  function populateRecruiters() {
    const previousSelection = recruiterSelect.value;
    
    // Clear dynamic options
    recruiterSelect.innerHTML = '<option value="all">All Recruiters</option>';
    
    // Get unique recruiter names
    const recruiters = new Set();
    candidatesData.forEach(cand => {
      const name = cand.recruiterName || cand.sourcingBy;
      if (name && name.trim()) {
        recruiters.add(name.trim());
      }
    });

    // Populate dropdown
    Array.from(recruiters).sort().forEach(recruiter => {
      const opt = document.createElement('option');
      opt.value = recruiter;
      opt.textContent = recruiter;
      recruiterSelect.appendChild(opt);
    });

    // Restore previous selection if it still exists
    if (Array.from(recruiters).includes(previousSelection)) {
      recruiterSelect.value = previousSelection;
    }
  }

  // Filter candidates based on current UI drop downs
  function getFilteredCandidates() {
    const selectedRecruiter = recruiterSelect.value;
    const selectedDate = dateSelect.value;
    
    return candidatesData.filter(cand => {
      // 1. Filter by Recruiter
      if (selectedRecruiter !== 'all') {
        const recruiter = cand.recruiterName || cand.sourcingBy;
        if (!recruiter || recruiter.trim() !== selectedRecruiter) {
          return false;
        }
      }
      
      // 2. Filter by Date Range (Today vs All)
      if (selectedDate === 'today') {
        if (!cand.createdAt) return false;
        
        const todayStr = new Date().toISOString().split('T')[0];
        // candidate createdAt could be ISO string (e.g. "2026-05-20T10:14:02.000Z")
        const candDateStr = cand.createdAt.split('T')[0];
        
        // Also check if candidate sourcingDate is today as fallback
        const candSourcingStr = cand.sourcingDate ? cand.sourcingDate.split('T')[0] : '';
        
        if (candDateStr !== todayStr && candSourcingStr !== todayStr) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Main generator dispatcher
  function generateReport() {
    if (!isConnected) return;
    
    const filtered = getFilteredCandidates();
    
    if (filtered.length === 0) {
      reportPreview.value = `No candidate logs found matching the filters:\n` +
        `- Recruiter: ${recruiterSelect.value === 'all' ? 'All' : recruiterSelect.value}\n` +
        `- Timeframe: ${dateSelect.value === 'today' ? "Today's Entries Only" : 'All Records'}\n\n` +
        `Try switching 'Data Range' to 'All Available' or adding candidate profiles in Givyansh CRM.`;
      return;
    }

    let reportText = '';
    
    switch (currentTab) {
      case 'sourcing':
        reportText = compileSourcingReport(filtered);
        break;
      case 'grid':
        reportText = compileInterviewGrid(filtered);
        break;
      case 'kpi':
        reportText = compileKPIReport(filtered);
        break;
    }
    
    reportPreview.value = reportText;
  }

  // 1. SOURCING REPORT GENERATION
  function compileSourcingReport(candidates) {
    const total = candidates.length;
    const statusCounts = {};
    let coldCallingCount = 0;
    
    candidates.forEach(cand => {
      // Aggregate statuses
      const status = cand.remarks || 'New';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Track Cold Calling vs Database/Portals
      if (cand.coldCalling === 'Yes' || cand.coldCalling === true || (cand.dataType && cand.dataType.toLowerCase() === 'cold_calling')) {
        coldCallingCount++;
      }
    });

    const isMarkdown = currentFormat === 'markdown';
    const dateLabel = dateSelect.value === 'today' ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Cumulative Pipeline';
    const recruiterLabel = recruiterSelect.value === 'all' ? 'All Recruiters' : recruiterSelect.value;
    
    let report = '';
    
    if (isMarkdown) {
      report += `# 📊 RECRUITMENT SOURCING REPORT\n`;
      report += `**Date:** ${dateLabel}\n`;
      report += `**Scope:** ${recruiterLabel}\n`;
      report += `**Total Candidates Sourced:** ${total}\n\n`;
      
      report += `### 📈 STATUS PIPELINE BREAKDOWN\n`;
      Object.keys(statusCounts).sort().forEach(status => {
        const count = statusCounts[status];
        const percent = ((count / total) * 100).toFixed(0);
        report += `- **${status}:** ${count} candidates (${percent}%)\n`;
      });
      
      report += `\n### 📞 CHANNEL METRICS\n`;
      const ccPercent = ((coldCallingCount / total) * 100).toFixed(0);
      report += `- **Cold Calling Sourced:** ${coldCallingCount} (${ccPercent}%)\n`;
      report += `- **Other Channels (Portals/CRM):** ${total - coldCallingCount} (${100 - ccPercent}%)\n\n`;
      
      report += `### 🤖 AI RECRUITMENT SUMMARY\n`;
      report += `Today's pipeline demonstrates highly active sourcing across *${recruiterLabel}*. `;
      if (statusCounts['Lined Up'] || statusCounts['Selected']) {
        report += `Key highlights include **${statusCounts['Lined Up'] || 0} candidate(s) successfully Lined Up** for interview panels and **${statusCounts['Selected'] || 0} candidate(s) Selected**. `;
      }
      report += `Recommended priority is to follow up on "New" profiles to qualify them and minimize interview No-Shows.\n\n`;
      report += `*Generated automatically by Fast RMS AI Companion.*`;
    } else {
      // Formal / Professional Plain Text
      report += `==================================================\n`;
      report += `DAILY SOURCING & RECRUITMENT UPDATE\n`;
      report += `==================================================\n`;
      report += `Date: ${dateLabel}\n`;
      report += `Recruiter Scope: ${recruiterLabel}\n`;
      report += `Total Candidates Logged: ${total}\n\n`;
      
      report += `PIPELINE STATUS SUMMARY:\n`;
      report += `--------------------------------------------------\n`;
      Object.keys(statusCounts).sort().forEach(status => {
        const count = statusCounts[status];
        const percent = ((count / total) * 100).toFixed(0);
        report += ` * ${status.padEnd(18)}: ${count} candidate(s) (${percent}%)\n`;
      });
      
      report += `\nSOURCING CHANNELS:\n`;
      report += `--------------------------------------------------\n`;
      const ccPercent = ((coldCallingCount / total) * 100).toFixed(0);
      report += ` * Cold Calling       : ${coldCallingCount} profile(s) (${ccPercent}%)\n`;
      report += ` * Portals & Database : ${total - coldCallingCount} profile(s) (${100 - ccPercent}%)\n\n`;
      
      report += `EXECUTIVE SUMMARY:\n`;
      report += `--------------------------------------------------\n`;
      report += `The team compiled ${total} candidate interactions in the specified window. Sourcing efforts have focused heavily on targeted outreach, achieving a cold call contribution rate of ${ccPercent}%. \n\n`;
      if (statusCounts['Lined Up']) {
        report += `Currently, ${statusCounts['Lined Up']} candidates are scheduled for active client interviews. Recruiters should verify attendance logs prior to interview schedules.\n\n`;
      }
      report += `Report compiled via Fast RMS AI.`;
    }
    
    return report;
  }

  // 2. INTERVIEW GRID GENERATION
  function compileInterviewGrid(candidates) {
    // Filter candidates that are scheduled for interviews
    // Either status is "Lined Up", or they have an interviewDate
    const interviewCandidates = candidates.filter(cand => {
      const isLinedUp = cand.remarks === 'Lined Up';
      const hasDate = cand.interviewDate !== null && cand.interviewDate !== '';
      return isLinedUp || hasDate;
    });

    const isMarkdown = currentFormat === 'markdown';
    const dateLabel = dateSelect.value === 'today' ? "Today's Schedules" : 'All Scheduled Interviews';
    const recruiterLabel = recruiterSelect.value === 'all' ? 'All Recruiters' : recruiterSelect.value;

    if (interviewCandidates.length === 0) {
      return `No interviews scheduled in this selection.\n\n` +
        `Note: To appear in the Interview Grid, candidates must either:\n` +
        `1. Have their Status set to 'Lined Up'.\n` +
        `2. Have a scheduled 'Interview Date' entered in Givyansh CRM.`;
    }

    let report = '';

    if (isMarkdown) {
      report += `# 📅 UPCOMING INTERVIEW MATRIX\n`;
      report += `**Report Scope:** ${recruiterLabel} | ${dateLabel}\n`;
      report += `**Total Panels Slated:** ${interviewCandidates.length} Candidates\n\n`;
      
      report += `| Candidate Name | Targeted Role | Company / Client | Date & Time | Contact | Recruiter |\n`;
      report += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      
      interviewCandidates.forEach(cand => {
        const name = cand.name || 'N/A';
        const role = cand.designation || cand.jobRole || 'N/A';
        const client = cand.clientName || 'N/A';
        
        // Format Date
        let dateStr = 'TBD';
        if (cand.interviewDate) {
          const d = new Date(cand.interviewDate);
          dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        const timeStr = cand.interviewTime || '';
        const timing = `${dateStr} ${timeStr}`.trim();
        
        const phone = cand.phone || 'N/A';
        const recruiter = cand.recruiterName || cand.sourcingBy || 'N/A';
        
        report += `| **${name}** | ${role} | ${client} | ${timing} | ${phone} | ${recruiter} |\n`;
      });
      
      report += `\n### 💡 CLIENT DISPATCH INSTRUCTIONS\n`;
      report += `Copy the tabulated panel above to send directly to your client coordinators. All profiles are vetted and active in Fast RMS database.\n\n`;
      report += `*Generated automatically by Fast RMS AI Companion.*`;
    } else {
      // Professional plain text format
      report += `======================================================================\n`;
      report += `INTERVIEW SCHEDULE MATRIX - FAST RMS\n`;
      report += `======================================================================\n`;
      report += `Scope: ${recruiterLabel} | ${dateLabel}\n`;
      report += `Total Scheduled Interviews: ${interviewCandidates.length}\n\n`;
      
      interviewCandidates.forEach((cand, idx) => {
        const name = cand.name || 'N/A';
        const role = cand.designation || cand.jobRole || 'N/A';
        const client = cand.clientName || 'N/A';
        
        // Format Date
        let dateStr = 'TBD';
        if (cand.interviewDate) {
          const d = new Date(cand.interviewDate);
          dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        const timeStr = cand.interviewTime || '';
        const timing = `${dateStr} @ ${timeStr}`.trim();
        
        const phone = cand.phone || 'N/A';
        const email = cand.email || 'N/A';
        const recruiter = cand.recruiterName || cand.sourcingBy || 'N/A';
        const reason = cand.remarkReason ? ` [Status Reason: ${cand.remarkReason}]` : '';

        report += `${idx + 1}. CANDIDATE: ${name}\n`;
        report += `   Target Role: ${role} | Client: ${client}\n`;
        report += `   Schedule   : ${timing}\n`;
        report += `   Contact    : Phone: ${phone} | Email: ${email}\n`;
        report += `   Recruiter  : ${recruiter}${reason}\n`;
        report += `   ------------------------------------------------------------------\n`;
      });
      
      report += `\nSummary: Please ensure all candidates are contacted 1 hour prior to their scheduled slots to minimize No-Show ratios.`;
    }

    return report;
  }

  // 3. KPI REPORT GENERATION
  function compileKPIReport(candidates) {
    const total = candidates.length;
    
    // Status breakdown
    let selected = 0;
    let rejected = 0;
    let linedUp = 0;
    let noShow = 0;
    let joined = 0;
    
    // Recruiter distribution
    const recruiterCounts = {};

    candidates.forEach(cand => {
      const status = cand.remarks || 'New';
      if (status === 'Selected') selected++;
      else if (status === 'Rejected') rejected++;
      else if (status === 'Lined Up') linedUp++;
      else if (status === 'No Show') noShow++;
      else if (status === 'Joined') joined++;

      const recruiter = cand.recruiterName || cand.sourcingBy || 'Unknown';
      recruiterCounts[recruiter] = (recruiterCounts[recruiter] || 0) + 1;
    });

    // Funnel Conversions
    const selectionRate = total > 0 ? ((selected / total) * 100).toFixed(1) : '0.0';
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : '0.0';
    const noShowRate = (linedUp + noShow) > 0 ? ((noShow / (linedUp + noShow)) * 100).toFixed(1) : '0.0';
    const pipelineHealth = selected > 0 ? 'High Performance' : (linedUp > 0 ? 'Healthy Pipeline' : 'Needs Optimization');

    const isMarkdown = currentFormat === 'markdown';
    const dateLabel = dateSelect.value === 'today' ? "Today's KPI Funnel" : 'Cumulative KPI Funnel';
    const recruiterLabel = recruiterSelect.value === 'all' ? 'All Recruiters' : recruiterSelect.value;

    let report = '';

    if (isMarkdown) {
      report += `# 🏆 AI KPI PERFORMANCE SCORECARD\n`;
      report += `**Analysis Window:** ${dateLabel}\n`;
      report += `**Scope:** ${recruiterLabel}\n\n`;
      
      report += `### 🎯 RECRUITMENT FUNNEL CONVERSION KEY METRICS\n`;
      report += `- **Total Sourced Profiles:** ${total}\n`;
      report += `- **Selection Rate (Selected / Sourced):** **${selectionRate}%** (Target: 15%)\n`;
      report += `- **Rejection Rate (Rejected / Sourced):** **${rejectionRate}%**\n`;
      report += `- **No-Show Rate (No Show / Slated):** **${noShowRate}%** (Target: < 10%)\n`;
      report += `- **Onboarded/Joined Count:** ${joined} Placement(s)\n\n`;
      
      report += `### 🧑‍💼 RECRUITER VOLUME LEADERBOARD\n`;
      Object.keys(recruiterCounts).sort((a,b) => recruiterCounts[b] - recruiterCounts[a]).forEach((rec, idx) => {
        const count = recruiterCounts[rec];
        const percent = ((count / total) * 100).toFixed(0);
        report += `${idx + 1}. **${rec}**: ${count} candidates logged (${percent}% of total sourcing)\n`;
      });
      
      report += `\n### 🤖 AI COMPANION RECOMMENDATIONS\n`;
      report += `- **Pipeline Rating:** \`${pipelineHealth}\`\n`;
      if (parseFloat(noShowRate) > 15) {
        report += `- ⚠️ **Warning:** The candidate No-Show rate is high (${noShowRate}%). Implement automated SMS/Call reminders 2 hours before scheduled interviews.\n`;
      } else {
        report += `- Checkmark: Candidate No-Show rate is kept under control (${noShowRate}%). Keep up the excellent candidate briefing protocols.\n`;
      }
      report += `- **Action Item:** Ensure active recruiter feedback loops on *Rejected* candidates to refine sourcing search parameters on platforms.\n\n`;
      report += `*Generated automatically by Fast RMS AI Companion.*`;
    } else {
      report += `==================================================\n`;
      report += `RECRUITER KPI PERFORMANCE SCORECARD\n`;
      report += `==================================================\n`;
      report += `Window: ${dateLabel}\n`;
      report += `Scope : ${recruiterLabel}\n`;
      report += `Total Evaluated Logs: ${total}\n\n`;
      
      report += `CONVERSION METRICS:\n`;
      report += `--------------------------------------------------\n`;
      report += ` * Sourced Candidates : ${total}\n`;
      report += ` * Interview Selection: ${selectionRate}% (${selected} Selected)\n`;
      report += ` * Panel Rejections   : ${rejectionRate}% (${rejected} Rejected)\n`;
      report += ` * Candidate No-Show  : ${noShowRate}% (${noShow} No Shows)\n`;
      report += ` * Candidate Placed   : ${joined} placement(s)\n\n`;
      
      report += `TEAM WORKLOAD SUMMARY:\n`;
      report += `--------------------------------------------------\n`;
      Object.keys(recruiterCounts).sort((a,b) => recruiterCounts[b] - recruiterCounts[a]).forEach((rec, idx) => {
        const count = recruiterCounts[rec];
        report += ` ${idx + 1}. ${rec.padEnd(20)}: ${count} candidates logged\n`;
      });
      
      report += `\nAI RECOMMENDATIONS & OBSERVATIONS:\n`;
      report += `--------------------------------------------------\n`;
      report += ` * Pipeline Assessment: Status is [${pipelineHealth}].\n`;
      if (parseFloat(noShowRate) > 15) {
        report += ` * WARNING: Current No-Show rate (${noShowRate}%) exceeds threshold of 10%.\n`;
        report += `   -> ACTION: Mandate team check-ins with candidates 2 hours prior to schedules.\n`;
      } else {
        report += ` * STATUS CHECK: Candidate engagement is highly efficient.\n`;
      }
      report += ` * ACTION: Shift sourcing focus towards critical roles to increase conversion.\n\n`;
      report += `Report generated via Fast RMS AI.`;
    }

    return report;
  }

  // Copy current preview text to clipboard
  function copyToClipboard() {
    const text = reportPreview.value;
    if (!text || text.includes('Connecting to CRM') || text.includes('🔴 OFFLINE')) {
      showToast('Nothing to copy yet!', true);
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('Report copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy!', true);
      });
  }

  // Inject report text directly into active web tab editor
  function injectIntoEmail() {
    const text = reportPreview.value;
    if (!text || text.includes('Connecting to CRM') || text.includes('🔴 OFFLINE')) {
      showToast('No report available to inject!', true);
      return;
    }

    // 1. Get active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        showToast('No active tab found!', true);
        return;
      }

      const activeTab = tabs[0];
      console.log('Targeting Tab for Injection:', activeTab.url);

      // Check if security constraints prevent running scripts (e.g. chrome:// tabs)
      if (activeTab.url && (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('chrome-extension://'))) {
        showToast('Cannot inject into browser settings pages!', true);
        return;
      }

      showToast('Injecting report text...', false);

      // 2. Inject content.js script and run the insertion function
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['content.js']
      })
      .then(() => {
        // Send a message or execute a function block in content.js scope
        chrome.tabs.sendMessage(activeTab.id, { 
          action: 'injectText', 
          text: text 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Script execution notice:', chrome.runtime.lastError.message);
            // Fallback: Try injecting script function directly
            runDirectInjection(activeTab.id, text);
          } else if (response && response.success) {
            showToast('Report injected successfully!');
          } else {
            showToast('Put cursor in email text box first!', true);
          }
        });
      })
      .catch(err => {
        console.error('Script injection error:', err);
        showToast('Permission error or editor not found!', true);
      });
    });
  }

  // Direct injection fallback
  function runDirectInjection(tabId, text) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (textToInsert) => {
        // Find focused element or any suitable compose box
        let activeEl = document.activeElement;
        
        // Helper to check if an element is a rich text editor or text input
        function isEditable(el) {
          if (!el) return false;
          if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return true;
          if (el.contentEditable === 'true' || el.getAttribute('contenteditable') === 'true') return true;
          return false;
        }

        if (!isEditable(activeEl)) {
          // Look for common Rich Text Editors or email compose boxes in DOM
          // Gmail, Hostinger Webmail (Roundcube / OX App Suite), Outlook, Yahoo
          const selectors = [
            'div[contenteditable="true"]',
            'iframe.cke_wysiwyg_frame', // CKEditor iframe
            'textarea[name="body"]',
            'textarea.compose-body',
            'div.gmail_default',
            'div.editor-container',
            '[role="textbox"]',
            'textarea'
          ];

          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
              if (el.tagName === 'IFRAME') {
                try {
                  const iframeDoc = el.contentDocument || el.contentWindow.document;
                  activeEl = iframeDoc.body;
                } catch(e) {}
              } else {
                activeEl = el;
              }
              break;
            }
          }
        }

        if (isEditable(activeEl) || activeEl.tagName === 'BODY') {
          // If content editable or iframe body
          if (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT') {
            const start = activeEl.selectionStart || 0;
            const end = activeEl.selectionEnd || 0;
            const val = activeEl.value;
            activeEl.value = val.substring(0, start) + textToInsert + val.substring(end);
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          } else {
            // ContentEditable
            activeEl.focus();
            
            // Try to use standard insertText command (best for undo history)
            try {
              const success = document.execCommand('insertText', false, textToInsert);
              if (success) return true;
            } catch(e) {}

            // Fallback insertion
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              const textNode = document.createTextNode(textToInsert);
              range.insertNode(textNode);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
              activeEl.dispatchEvent(new Event('input', { bubbles: true }));
              return true;
            } else {
              activeEl.innerText += '\n' + textToInsert;
              activeEl.dispatchEvent(new Event('input', { bubbles: true }));
              return true;
            }
          }
        }
        return false;
      },
      args: [text]
    }, (results) => {
      if (results && results[0] && results[0].result) {
        showToast('Report injected successfully!');
      } else {
        showToast('Put cursor in email text box first!', true);
      }
    });
  }

  // Floating Toast notification banner helper
  function showToast(message, isWarning = false) {
    toastMessage.textContent = message;
    
    // Custom colors
    if (isWarning) {
      toast.style.background = 'rgba(244, 63, 94, 0.15)';
      toast.style.border = '1px solid rgba(244, 63, 94, 0.35)';
      toast.style.color = '#fda4af';
      document.querySelector('.toast-icon').textContent = '⚠';
      document.querySelector('.toast-icon').style.background = 'rgba(244, 63, 94, 0.2)';
    } else {
      toast.style.background = 'rgba(16, 185, 129, 0.15)';
      toast.style.border = '1px solid rgba(16, 185, 129, 0.35)';
      toast.style.color = '#34d399';
      document.querySelector('.toast-icon').textContent = '✓';
      document.querySelector('.toast-icon').style.background = 'rgba(16, 185, 129, 0.2)';
    }
    
    toast.classList.add('active');
    
    // Clear toast
    setTimeout(() => {
      toast.classList.remove('active');
    }, 2800);
  }
});
