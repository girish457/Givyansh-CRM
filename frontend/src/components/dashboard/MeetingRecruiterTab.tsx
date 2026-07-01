import React, { useState, useEffect, useMemo } from "react";
import { 
  LucideCalendar, LucideClock, LucidePlay, LucideBookOpen, 
  LucideAlertCircle, LucideVolume2, LucideCheckCircle2, LucideFileText, LucideLoader2
} from "lucide-react";
import MeetingRoom from "./MeetingRoom";

interface MeetingRecruiterTabProps {
  currentUser: {
    id: number;
    name: string;
    role: string;
    companyId: number;
  } | null;
  role: "superadmin" | "boss" | "manager" | "tl" | "recruiter";
}

export default function MeetingRecruiterTab({ currentUser, role }: MeetingRecruiterTabProps) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Sub-tabs: "upcoming" | "active" | "past" | "missed"
  const [activeSubTab, setActiveSubTab] = useState<"upcoming" | "active" | "past" | "missed">("upcoming");

  // Missed meeting feedback states
  const [missedReasonTarget, setMissedReasonTarget] = useState<any | null>(null);
  const [missedReason, setMissedReason] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/meetings");
      if (res.ok) {
        setMeetings(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Check if query parameter has direct join room request
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      localStorage.setItem("current_active_meeting_id", room);
      window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
      window.history.pushState(null, "", window.location.pathname);
    }
  }, [window.location.search]);

  // Meeting categorizations based on attendance logs and status
  const sortedMeetings = useMemo(() => {
    const upcomingList: any[] = [];
    const activeList: any[] = [];
    const pastList: any[] = [];
    const missedList: any[] = [];

    meetings.forEach(m => {
      // Find current user's attendance status
      const myAtt = m.attendances?.find((a: any) => Number(a.userId) === Number(currentUser?.id));
      const hasJoined = myAtt && myAtt.joinTime;
      const isAbsent = !myAtt || myAtt.status === "absent";

      if (m.status === "live") {
        activeList.push(m);
      } else if (m.status === "scheduled" || m.status === "rescheduled") {
        upcomingList.push(m);
      } else if (m.status === "completed") {
        if (hasJoined) {
          pastList.push({ ...m, attendance: myAtt });
        } else if (isAbsent) {
          missedList.push({ ...m, attendance: myAtt });
        }
      } else if (m.status === "cancelled") {
        // Cancelled meetings can be shown in past/cancelled list
        pastList.push(m);
      }
    });

    return { upcomingList, activeList, pastList, missedList };
  }, [meetings, currentUser]);

  const handleJoinRoom = async (mId: number) => {
    try {
      const res = await fetch(`/api/meetings/${mId}/join`, { method: "POST" });
      if (res.ok) {
        localStorage.setItem("current_active_meeting_id", mId.toString());
        window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
      }
    } catch (e) {}
  };

  const handleSubmitMissedReason = async () => {
    if (!missedReason.trim() || !missedReasonTarget) return;

    try {
      const res = await fetch(`/api/meetings/${missedReasonTarget.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: missedReason })
      });

      if (res.ok) {
        alert("Missed meeting justification logged successfully.");
        setMissedReasonTarget(null);
        setMissedReason("");
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };



  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Meetings...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", color: "#1e293b", minHeight: "100%", background: "#f8fafc" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <LucideCalendar size={28} color="#2563eb" /> Meeting's & Team Briefings
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, margin: "2px 0 0" }}>
            View and join company live briefings, check schedules, and review historical briefings.
          </p>
        </div>

        {/* Sub-tabs toggle */}
        <div style={{ display: "flex", background: "#ffffff", padding: "4px", borderRadius: "10px", border: "1px solid #e2e8f0", gap: "4px" }}>
          <button
            onClick={() => setActiveSubTab("upcoming")}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeSubTab === "upcoming" ? "#2563eb" : "transparent",
              color: activeSubTab === "upcoming" ? "white" : "#475569",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            Upcoming ({sortedMeetings.upcomingList.length})
          </button>
          <button
            onClick={() => setActiveSubTab("active")}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeSubTab === "active" ? "#ef4444" : "transparent",
              color: activeSubTab === "active" ? "white" : "#475569",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            Active Now ({sortedMeetings.activeList.length})
          </button>
          <button
            onClick={() => setActiveSubTab("past")}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeSubTab === "past" ? "#2563eb" : "transparent",
              color: activeSubTab === "past" ? "white" : "#475569",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            History / Past ({sortedMeetings.pastList.length})
          </button>
          <button
            onClick={() => setActiveSubTab("missed")}
            style={{
              padding: "8px 16px",
              border: "none",
              background: activeSubTab === "missed" ? "#f59e0b" : "transparent",
              color: activeSubTab === "missed" ? "white" : "#475569",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            Missed ({sortedMeetings.missedList.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
          Loading your meeting sector...
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
          {/* TAB: UPCOMING */}
          {activeSubTab === "upcoming" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedMeetings.upcomingList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#64748b", fontSize: "0.8rem" }}>
                  No scheduled briefings at the moment.
                </div>
              ) : (
                sortedMeetings.upcomingList.map(m => (
                  <div key={m.id} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "0.88rem", color: "#1e293b" }}>{m.title}</strong>
                        <span style={{ fontSize: "0.6rem", background: "rgba(37,99,235,0.08)", color: "#2563eb", padding: "2px 8px", borderRadius: "20px", fontWeight: 850 }}>
                          {m.priority?.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#475569", display: "flex", gap: "16px", marginTop: "6px" }}>
                        <span><strong>Host:</strong> {m.host?.name || "Briefing Host"}</span>
                        <span><strong>Date:</strong> {m.scheduledDate}</span>
                        <span><strong>Time:</strong> {m.scheduledTime}</span>
                        <span><strong>Est. Duration:</strong> {m.duration} mins</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: ACTIVE NOW */}
          {activeSubTab === "active" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedMeetings.activeList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#64748b", fontSize: "0.8rem" }}>
                  No active live briefing rooms running.
                </div>
              ) : (
                sortedMeetings.activeList.map(m => (
                  <div key={m.id} style={{ border: "1px solid #fee2e2", background: "rgba(239, 68, 68, 0.02)", borderRadius: "10px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "0.88rem", color: "#991b1b" }}>{m.title}</strong>
                        <span style={{ fontSize: "0.55rem", background: "#ef4444", color: "white", padding: "2px 8px", borderRadius: "10px", fontWeight: 900, textTransform: "uppercase", animation: "pulse 1.2s infinite" }}>
                          Live Now
                        </span>
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#475569", display: "flex", gap: "16px", marginTop: "6px" }}>
                        <span><strong>Host:</strong> {m.host?.name || "Briefing Host"}</span>
                        <span><strong>Agenda:</strong> {m.agenda || "Briefing Info"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(m.id)}
                      style={{
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 10px rgba(239,68,68,0.2)"
                      }}
                    >
                      <LucidePlay size={12} /> Join Room
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeSubTab === "past" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedMeetings.pastList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#64748b", fontSize: "0.8rem" }}>
                  No past meeting records registered.
                </div>
              ) : (
                sortedMeetings.pastList.map(m => {
                  let aiSummary: any = null;
                  if (m.summary) {
                    try {
                      aiSummary = JSON.parse(m.summary);
                    } catch (e) {}
                  }

                  return (
                    <details key={m.id} style={{ border: "1px solid #cbd5e1", borderRadius: "10px", padding: "12px", cursor: "pointer", background: "#f8fafc" }}>
                      <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", outline: "none", fontWeight: 800, fontSize: "0.82rem", color: "#1e293b" }}>
                        <div>
                          <span>📅 {m.scheduledDate} - {m.title}</span>
                          <span style={{ marginLeft: "10px", fontSize: "0.65rem", background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "10px" }}>
                            Joined: {m.attendance?.duration ? Math.round(m.attendance.duration / 60) : 0} mins
                          </span>
                        </div>
                      </summary>

                      <div style={{ marginTop: "12px", padding: "12px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px", cursor: "default" }} onClick={e => e.stopPropagation()}>
                        <div>
                          <h4 style={{ fontSize: "0.75rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Discussion Summary</h4>
                          <p style={{ fontSize: "0.75rem", color: "#475569", margin: 0 }}>
                            {aiSummary?.discussionSummary || "AI summary not compiled."}
                          </p>
                        </div>

                        {aiSummary?.keyPoints && (
                          <div>
                            <h4 style={{ fontSize: "0.75rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Key Discussion Points</h4>
                            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.75rem", color: "#475569" }}>
                              {aiSummary.keyPoints.map((pt: string, idx: number) => (
                                <li key={idx} style={{ marginTop: "2px" }}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {m.recordingUrl && (
                          <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                            <span style={{ fontSize: "0.7rem", color: "#2563eb", background: "rgba(37,99,235,0.06)", padding: "4px 10px", borderRadius: "6px", fontWeight: 800 }}>
                              📹 Recording Available
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "#16a34a", background: "rgba(22,163,74,0.06)", padding: "4px 10px", borderRadius: "6px", fontWeight: 800 }}>
                              📝 Transcript Logged
                            </span>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: MISSED */}
          {activeSubTab === "missed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedMeetings.missedList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#64748b", fontSize: "0.8rem" }}>
                  Outstanding! You have attended all briefings in this sector.
                </div>
              ) : (
                sortedMeetings.missedList.map(m => {
                  const hasSubmittedReason = m.attendance && m.attendance.rejected;
                  return (
                    <div key={m.id} style={{ border: "1px solid #f59e0b", background: "rgba(245, 158, 11, 0.01)", borderRadius: "10px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "0.88rem", color: "#b45309" }}>{m.title}</strong>
                          <span style={{ fontSize: "0.6rem", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "20px", fontWeight: 900 }}>
                            MISSED
                          </span>
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#475569", display: "flex", gap: "16px", marginTop: "6px" }}>
                          <span><strong>Host:</strong> {m.host?.name || "Briefing Host"}</span>
                          <span><strong>Date:</strong> {m.scheduledDate}</span>
                          <span><strong>Time:</strong> {m.scheduledTime}</span>
                        </div>

                        {hasSubmittedReason && (
                          <div style={{ marginTop: "8px", fontSize: "0.72rem", color: "#475569", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                            <strong>Justification:</strong> "{m.attendance.rejectReason}"
                          </div>
                        )}
                      </div>

                      {!hasSubmittedReason && (
                        <button
                          onClick={() => setMissedReasonTarget(m)}
                          style={{
                            background: "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: "0 4px 10px rgba(245,158,11,0.2)"
                          }}
                        >
                          Provide Reason
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* OVERLAY MODAL: SUBMIT MISSED REASON */}
      {missedReasonTarget && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "400px", border: "1px solid #cbd5e1" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#d97706", margin: "0 0 8px 0" }}>Briefing Absence Justification</h3>
            <p style={{ fontSize: "0.78rem", color: "#475569", margin: "0 0 14px 0", fontWeight: 500 }}>
              Provide a valid excuse or operational reason for missing: <strong>"{missedReasonTarget.title}"</strong>.
            </p>
            <textarea
              required
              placeholder="e.g. Sourced candidates call line was active during briefing hour..."
              value={missedReason}
              onChange={(e) => setMissedReason(e.target.value)}
              style={{
                width: "100%",
                height: "80px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                padding: "10px",
                fontSize: "0.8rem",
                outline: "none",
                resize: "none",
                fontWeight: 600,
                marginBottom: "16px"
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSubmitMissedReason}
                style={{ flex: 1, background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer" }}
              >
                Log Justification
              </button>
              <button
                onClick={() => { setMissedReasonTarget(null); setMissedReason(""); }}
                style={{ flex: 1, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer" }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
