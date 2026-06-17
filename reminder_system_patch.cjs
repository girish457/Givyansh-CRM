const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'Recruiter.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Implementing Advanced Interview Reminder System...');

// 1. Add Lucide icons needed for the popups
const icons = ['LucideBell', 'LucidePhone', 'LucideCheck', 'LucideX', 'LucideRefreshCw', 'LucideUser', 'LucideClock3', 'LucidePartyPopper'];
icons.forEach(icon => {
    if (!content.includes(icon)) {
        content = content.replace('LucideDownload', `LucideDownload, ${icon}`);
    }
});

// 2. Define the ReminderSystem Component
const reminderSystemCode = `
// --- ADVANCED REMINDER SYSTEM ---
const ReminderSystem = ({ candidates, onRefresh }: { candidates: any[], onRefresh: () => void }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Persistence Key
  const STORAGE_KEY = "crm_active_reminders";

  // Initialize reminders from candidates and localStorage
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const savedReminders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      
      const newQueue = [...savedReminders];
      let updated = false;

      // Check candidates for new interview reminders
      candidates.forEach(c => {
        if (c.interviewDate && c.remarks === "Interested" && !newQueue.find(r => r.id === c.id)) {
          const iDate = new Date(c.interviewDate);
          // If time is scheduled (using a dummy 9am if missing)
          const iTime = c.interviewTime || "09:00";
          const [h, m] = iTime.split(':');
          iDate.setHours(parseInt(h), parseInt(m), 0);

          if (now >= iDate) {
            newQueue.push({
              id: c.id,
              name: c.name,
              phone: c.phone,
              date: c.interviewDate,
              time: c.interviewTime,
              type: 'INITIAL_REMINDER',
              triggerAt: Date.now()
            });
            updated = true;
          }
        }
      });

      // Filter reminders that are ready to show
      const readyItems = newQueue.filter(r => !r.shown && Date.now() >= (r.triggerAt || 0));
      if (readyItems.length > 0 && !active) {
        setActive(readyItems[0]);
      }

      if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [candidates, active]);

  const updateReminder = (id: string, updates: any) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = saved.map((r: any) => r.id === id ? { ...r, ...updates } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setActive(null);
  };

  const removeReminder = (id: string) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = saved.filter((r: any) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    setActive(null);
  };

  const handleAction = async (action: string, id: string) => {
    setIsProcessing(true);
    try {
      if (action === "CALL_NOT_PICK") {
        updateReminder(id, { triggerAt: Date.now() + 10 * 60 * 1000, shown: false });
      } else if (action === "GO_FOR_INTERVIEW") {
        updateReminder(id, { type: 'STATUS_CHECK', triggerAt: Date.now() + 5 * 60 * 60 * 1000, shown: false });
      } else if (action === "NOT_INTERESTED") {
        await updateCandidateStatus(id, "Not Interested");
        removeReminder(id);
      } else if (action === "SCHEDULE_LATER") {
        setActive({ ...active, subType: 'RESCHEDULE' });
      } else if (action === "SELECTED") {
        setActive({ ...active, type: 'SELECTED_CELEBRATION' });
      } else if (action === "REJECTED") {
        await updateCandidateStatus(id, "Rejected");
        removeReminder(id);
      } else if (action === "JOINED") {
        await updateCandidateStatus(id, "Joined");
        removeReminder(id);
      } else if (action === "PROCESS_TO_JOINING") {
        updateReminder(id, { type: 'JOINING_CHECK', triggerAt: Date.now() + 24 * 60 * 60 * 1000, shown: false });
      } else if (action === "REVERT_LATER") {
        updateReminder(id, { triggerAt: Date.now() + 24 * 60 * 60 * 1000, shown: false });
      } else if (action === "YES_JOINED") {
        await updateCandidateStatus(id, "Joined");
        removeReminder(id);
      } else if (action === "NO_DROPPED") {
        await updateCandidateStatus(id, "Dropped");
        removeReminder(id);
      }
      onRefresh();
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  };

  const updateCandidateStatus = async (id: string, status: string) => {
    // In a real app, this calls your API. We'll simulate success for now.
    await fetch("/api/candidates/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: status })
    });
  };

  if (!active) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "450px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      >
        <div style={{ background: active.type === 'SELECTED_CELEBRATION' ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)", padding: "30px", textAlign: "center", color: "#fff" }}>
          {active.type === 'SELECTED_CELEBRATION' ? <LucidePartyPopper size={48} style={{ marginBottom: "15px" }} /> : <LucideBell size={48} style={{ marginBottom: "15px" }} />}
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>{
            active.type === 'STATUS_CHECK' ? "Interview Result Status" :
            active.type === 'SELECTED_CELEBRATION' ? "Celebration Time!" :
            active.type === 'JOINING_CHECK' ? "Final Joining Check" :
            "Interview Reminder"
          }</h2>
          <p style={{ opacity: 0.9, fontSize: "0.9rem", marginTop: "5px" }}>{
            active.type === 'SELECTED_CELEBRATION' ? active.name + " selected, nice!! Well done 🎉" :
            active.type === 'STATUS_CHECK' ? "What is status of " + active.name + "?" :
            active.type === 'JOINING_CHECK' ? "Is " + active.name + " joined?" :
            "Time to connect with the candidate"
          }</p>
        </div>

        <div style={{ padding: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px", background: "#f8fafc", padding: "15px", borderRadius: "16px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800 }}>{active.name[0]}</div>
            <div>
              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.1rem" }}>{active.name}</div>
              <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>{active.phone}</div>
            </div>
            <a href={"tel:" + active.phone} style={{ marginLeft: "auto", background: "#22c55e", color: "#fff", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><LucidePhone size={20} /></a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {active.type === 'INITIAL_REMINDER' && (
              <>
                <button onClick={() => handleAction("CALL_NOT_PICK", active.id)} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Call Not Pick</button>
                <button onClick={() => handleAction("GO_FOR_INTERVIEW", active.id)} className="btn-reminder" style={{ background: "#2563eb", color: "#fff" }}>Go For Interview</button>
                <button onClick={() => handleAction("NOT_INTERESTED", active.id)} className="btn-reminder" style={{ background: "#fee2e2", color: "#dc2626" }}>Not Interested</button>
                <button onClick={() => handleAction("SCHEDULE_LATER", active.id)} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Schedule Later</button>
              </>
            )}

            {active.type === 'STATUS_CHECK' && (
              <>
                <button onClick={() => handleAction("SELECTED", active.id)} className="btn-reminder" style={{ background: "#22c55e", color: "#fff" }}>Selected</button>
                <button onClick={() => handleAction("REJECTED", active.id)} className="btn-reminder" style={{ background: "#dc2626", color: "#fff" }}>Rejected</button>
                <button onClick={() => handleAction("JOINED", active.id)} className="btn-reminder" style={{ background: "#2563eb", color: "#fff" }}>Joined</button>
                <button onClick={() => handleAction("PROCESS_TO_JOINING", active.id)} className="btn-reminder" style={{ background: "#0f172a", color: "#fff" }}>Process To Joining</button>
              </>
            )}

            {active.type === 'SELECTED_CELEBRATION' && (
              <>
                <button onClick={() => handleAction("PROCESS_TO_JOINING", active.id)} className="btn-reminder" style={{ background: "#2563eb", color: "#fff", gridColumn: "span 2" }}>Process To Joining</button>
                <button onClick={() => handleAction("JOINED", active.id)} className="btn-reminder" style={{ background: "#22c55e", color: "#fff" }}>Joined</button>
                <button onClick={() => handleAction("REVERT_LATER", active.id)} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Revert Later</button>
              </>
            )}

            {active.type === 'JOINING_CHECK' && (
              <>
                <button onClick={() => handleAction("YES_JOINED", active.id)} className="btn-reminder" style={{ background: "#22c55e", color: "#fff" }}>Yes (Joined)</button>
                <button onClick={() => handleAction("NO_DROPPED", active.id)} className="btn-reminder" style={{ background: "#dc2626", color: "#fff" }}>No (Dropped)</button>
              </>
            )}
          </div>
        </div>
      </motion.div>
      <style>{\`
        .btn-reminder {
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-reminder:hover { opacity: 0.9; transform: translateY(-1px); }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      \`}</style>
    </div>
  );
};
`;

// 3. Inject the component and usage
if (!content.includes('const ReminderSystem')) {
    content = content.replace('export default function RecruiterDashboard', reminderSystemCode + '\nexport default function RecruiterDashboard');
}

// Use the component inside the render switch or main layout
const usageCode = `<ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />`;
if (!content.includes('<ReminderSystem')) {
    content = content.replace('<div className="full-pool-container">', usageCode + '\n    <div className="full-pool-container">');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Advanced Reminder System Implemented!');
