import { useState, useEffect } from "react";
import { 
  LucideVideo, 
  LucideShield, 
  LucideSliders, 
  LucidePlayCircle, 
  LucideCheck, 
  LucideAlertCircle, 
  LucideClock, 
  LucideCamera, 
  LucideMic, 
  LucideScreenShare, 
  LucideMessageSquare, 
  LucideFileText, 
  LucidePower, 
  LucideActivity, 
  LucideEye, 
  LucideUsers, 
  LucideCheckSquare,
  LucideZap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BossMeetingControlCenterProps {
  currentUser: any;
}

export default function BossMeetingControlCenter({ currentUser }: BossMeetingControlCenterProps) {
  const [settings, setSettings] = useState({
    moduleEnabled: true,
    maxDuration: 120,
    recordingAllowed: true,
    screenshareAllowed: true,
    chatAllowed: true,
    cameraAllowed: true,
    micAllowed: true,
    aiSummaryAllowed: true,
    reminderTimings: "24h,1h,15m,5m"
  });

  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"settings" | "live" | "audit">("settings");
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  useEffect(() => {
    fetchSettings();
    fetchMeetings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/meetings/company-settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Error fetching company meeting settings:", err);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/meetings");
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/meetings/company-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Error saving meeting settings:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleForceEnd = async (meetingId: number) => {
    if (!window.confirm("Are you sure you want to force end this meeting? All current participants will be disconnected immediately.")) {
      return;
    }
    try {
      const res = await fetch(`/api/meetings/${meetingId}/end`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        alert("Meeting force-ended successfully.");
        fetchMeetings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to end meeting.");
      }
    } catch (err) {
      console.error("Error force-ending meeting:", err);
    }
  };

  const handleViewMeetingDetails = async (meeting: any) => {
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedMeeting(data);
        setShowDetailModal(true);
      } else {
        setSelectedMeeting(meeting);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error("Error fetching detailed meeting report:", err);
      setSelectedMeeting(meeting);
      setShowDetailModal(true);
    }
  };

  const liveMeetings = meetings.filter(m => m.status === "live");
  const pastMeetings = meetings.filter(m => ["completed", "cancelled", "expired", "missed"].includes(m.status));

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: "#1e293b", padding: "16px 0" }}>
      {/* Tab Menu Header */}
      <div style={{
        display: "flex",
        gap: "10px",
        background: "rgba(241, 245, 249, 0.6)",
        padding: "6px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        marginBottom: "24px",
        maxWidth: "500px"
      }}>
        <button
          onClick={() => setActiveTab("settings")}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "none",
            borderRadius: "8px",
            background: activeTab === "settings" ? "#ffffff" : "transparent",
            color: activeTab === "settings" ? "#2563eb" : "#64748b",
            fontSize: "0.85rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: activeTab === "settings" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s"
          }}
        >
          <LucideSliders size={15} /> Settings
        </button>
        <button
          onClick={() => setActiveTab("live")}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "none",
            borderRadius: "8px",
            background: activeTab === "live" ? "#ffffff" : "transparent",
            color: activeTab === "live" ? "#2563eb" : "#64748b",
            fontSize: "0.85rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: activeTab === "live" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s"
          }}
        >
          <LucideActivity size={15} /> Active Sessions ({liveMeetings.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "none",
            borderRadius: "8px",
            background: activeTab === "audit" ? "#ffffff" : "transparent",
            color: activeTab === "audit" ? "#2563eb" : "#64748b",
            fontSize: "0.85rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: activeTab === "audit" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s"
          }}
        >
          <LucideShield size={15} /> Audit Log
        </button>
      </div>

      {/* Settings Panel */}
      {activeTab === "settings" && (
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "24px",
          border: "1.5px solid #e2e8f0",
          padding: "28px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{
              background: "rgba(37,99,235,0.1)",
              color: "#2563eb",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <LucideShield size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0 }}>Company-Wide Meeting Controls</h3>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Enforce specific constraints across all meetings hosted inside Givyansh CRM.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            {/* Left Column Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Module Enabled */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", display: "block" }}>Meeting System Module</label>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Master toggle to enable/disable all calls and tabs.</span>
                </div>
                <button
                  onClick={() => handleToggle("moduleEnabled")}
                  style={{
                    background: settings.moduleEnabled ? "#16a34a" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    width: "48px",
                    height: "26px",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "3px",
                    left: settings.moduleEnabled ? "25px" : "3px",
                    transition: "left 0.2s"
                  }} />
                </button>
              </div>

              {/* Mic Allowed */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <LucideMic size={16} style={{ color: "#64748b" }} />
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", display: "block" }}>Force Microphones Enabled</label>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Allow/restrict participant voice inputs.</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("micAllowed")}
                  style={{
                    background: settings.micAllowed ? "#2563eb" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    width: "48px",
                    height: "26px",
                    position: "relative",
                    cursor: "pointer"
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "3px",
                    left: settings.micAllowed ? "25px" : "3px",
                    transition: "left 0.2s"
                  }} />
                </button>
              </div>

              {/* Camera Allowed */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <LucideCamera size={16} style={{ color: "#64748b" }} />
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", display: "block" }}>Camera Permission</label>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Allow/restrict participant webcam video streams.</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("cameraAllowed")}
                  style={{
                    background: settings.cameraAllowed ? "#2563eb" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    width: "48px",
                    height: "26px",
                    position: "relative",
                    cursor: "pointer"
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "3px",
                    left: settings.cameraAllowed ? "25px" : "3px",
                    transition: "left 0.2s"
                  }} />
                </button>
              </div>

              {/* Screenshare Allowed */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <LucideScreenShare size={16} style={{ color: "#64748b" }} />
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", display: "block" }}>In-Portal CRM Screen Sharing</label>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Allow presenters to display database layouts.</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("screenshareAllowed")}
                  style={{
                    background: settings.screenshareAllowed ? "#2563eb" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    width: "48px",
                    height: "26px",
                    position: "relative",
                    cursor: "pointer"
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "3px",
                    left: settings.screenshareAllowed ? "25px" : "3px",
                    transition: "left 0.2s"
                  }} />
                </button>
              </div>
            </div>

            {/* Right Column Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Max Duration */}
              <div style={{
                padding: "12px 16px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Maximum Meeting Duration (Minutes)
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="number"
                    value={settings.maxDuration}
                    onChange={(e) => handleInputChange("maxDuration", parseInt(e.target.value) || 60)}
                    style={{
                      width: "80px",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.85rem",
                      fontWeight: 700
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Meetings auto-terminate upon reaching limit.</span>
                </div>
              </div>

              {/* Chat Allowed */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <LucideMessageSquare size={16} style={{ color: "#64748b" }} />
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", display: "block" }}>Interactive Text Chat</label>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Allows text messages and link sharing in-meeting.</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("chatAllowed")}
                  style={{
                    background: settings.chatAllowed ? "#2563eb" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    width: "48px",
                    height: "26px",
                    position: "relative",
                    cursor: "pointer"
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "3px",
                    left: settings.chatAllowed ? "25px" : "3px",
                    transition: "left 0.2s"
                  }} />
                </button>
              </div>

              {/* AI Summary Allowed */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <LucideFileText size={16} style={{ color: "#64748b" }} />
                  <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", display: "block" }}>AI Summary & Transcripts</label>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Automate highlights and action notes post-meet.</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("aiSummaryAllowed")}
                  style={{
                    background: settings.aiSummaryAllowed ? "#2563eb" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    width: "48px",
                    height: "26px",
                    position: "relative",
                    cursor: "pointer"
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: "3px",
                    left: settings.aiSummaryAllowed ? "25px" : "3px",
                    transition: "left 0.2s"
                  }} />
                </button>
              </div>

              {/* Reminder Timings */}
              <div style={{
                padding: "12px 16px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Reminder Timing Engine Thresholds
                </label>
                <input
                  type="text"
                  value={settings.reminderTimings}
                  onChange={(e) => handleInputChange("reminderTimings", e.target.value)}
                  placeholder="e.g. 24h,1h,15m,5m"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.85rem",
                    fontWeight: 700
                  }}
                />
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", display: "block", marginTop: "4px" }}>
                  Comma-separated intervals (e.g. 24h, 1h, 15m, 5m) triggering alert bells.
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSaveSettings}
              disabled={saveStatus === "saving"}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                border: "none",
                borderRadius: "12px",
                fontWeight: 900,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {saveStatus === "saving" ? (
                <>Saving Changes...</>
              ) : saveStatus === "success" ? (
                <>
                  <LucideCheck size={16} /> Config Synchronized
                </>
              ) : saveStatus === "error" ? (
                <>
                  <LucideAlertCircle size={16} /> Update Failed
                </>
              ) : (
                <>
                  <LucidePower size={16} /> Commit Controls
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Live Sessions Monitor */}
      {activeTab === "live" && (
        <div style={{
          background: "#ffffff",
          borderRadius: "24px",
          border: "1.5px solid #e2e8f0",
          padding: "24px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 950, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <LucideActivity size={18} style={{ color: "#ef4444" }} /> Live Enterprise Telemetry
          </h3>

          {liveMeetings.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "#f8fafc",
              borderRadius: "16px",
              border: "1.5px dashed #cbd5e1"
            }}>
              <LucideVideo size={36} style={{ color: "#94a3b8", marginBottom: "12px" }} />
              <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0, fontWeight: 700 }}>No Active Meetings Found</p>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "4px 0 0" }}>When employees launch interactive instant or scheduled meets, they show up here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {liveMeetings.map((meet) => {
                let participantCount = 0;
                try {
                  participantCount = JSON.parse(meet.participants || "[]").length;
                } catch(e){}

                return (
                  <div key={meet.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    background: "rgba(239, 68, 68, 0.02)",
                    borderRadius: "16px",
                    border: "1.5px solid rgba(239, 68, 68, 0.15)",
                    transition: "transform 0.15s ease"
                  }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div className="pulse-red" style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#ef4444"
                      }} />
                      <div>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 900, margin: 0 }}>{meet.title}</h4>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px", fontSize: "0.75rem", color: "#64748b" }}>
                          <span>Host: <strong style={{ color: "#334155" }}>{meet.host?.name || "Host"}</strong> ({meet.host?.role?.toUpperCase()})</span>
                          <span>•</span>
                          <span>Type: <strong style={{ textTransform: "capitalize" }}>{meet.meetingType}</strong></span>
                          <span>•</span>
                          <span>Estimated Duration: <strong>{meet.duration}m</strong></span>
                          <span>•</span>
                          <span>Priority: <strong style={{
                            color: meet.priority === "mandatory" || meet.priority === "critical" ? "#ef4444" : meet.priority === "important" ? "#f97316" : "#64748b"
                          }}>{meet.priority?.toUpperCase()}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 800, background: "#f1f5f9", padding: "6px 12px", borderRadius: "8px" }}>
                        <LucideUsers size={14} style={{ color: "#64748b" }} />
                        <span>{participantCount} Invited</span>
                      </div>
                      
                      <button
                        onClick={() => handleForceEnd(meet.id)}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          padding: "8px 14px",
                          fontSize: "0.8rem",
                          fontWeight: 900,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 4px 10px rgba(239, 68, 68, 0.2)"
                        }}
                      >
                        <LucidePower size={14} /> Force End
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Audit Log / Past Sessions */}
      {activeTab === "audit" && (
        <div style={{
          background: "#ffffff",
          borderRadius: "24px",
          border: "1.5px solid #e2e8f0",
          padding: "24px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.02)"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 950, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <LucideShield size={18} style={{ color: "#475569" }} /> Audit Logs & Meeting Briefings
          </h3>

          {pastMeetings.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "#f8fafc",
              borderRadius: "16px",
              border: "1.5px dashed #cbd5e1"
            }}>
              <LucideFileText size={36} style={{ color: "#94a3b8", marginBottom: "12px" }} />
              <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0, fontWeight: 700 }}>No Historic Logs Available</p>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "4px 0 0" }}>A complete history of company syncs, AI summaries, and recruiter attendance metrics will populate here.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                    <th style={{ padding: "12px 10px", fontWeight: 800 }}>MEETING DETAILS</th>
                    <th style={{ padding: "12px 10px", fontWeight: 800 }}>HOST</th>
                    <th style={{ padding: "12px 10px", fontWeight: 800 }}>DATE & TIME</th>
                    <th style={{ padding: "12px 10px", fontWeight: 800 }}>STATUS</th>
                    <th style={{ padding: "12px 10px", fontWeight: 800 }}>PRIORITY</th>
                    <th style={{ padding: "12px 10px", fontWeight: 800, textAlign: "right" }}>REPORT</th>
                  </tr>
                </thead>
                <tbody>
                  {pastMeetings.map((meet) => {
                    const localDateTimeString = meet.scheduledDate 
                      ? `${meet.scheduledDate} @ ${meet.scheduledTime || ""}` 
                      : new Date(meet.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

                    return (
                      <tr key={meet.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }} onClick={() => handleViewMeetingDetails(meet)}>
                        <td style={{ padding: "12px 10px" }}>
                          <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>{meet.title}</strong>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{meet.agenda || "No agenda set"}</div>
                        </td>
                        <td style={{ padding: "12px 10px", color: "#334155", fontWeight: 700 }}>{meet.host?.name || "Host"}</td>
                        <td style={{ padding: "12px 10px", color: "#64748b" }}>{localDateTimeString}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            background: meet.status === "completed" ? "#dcfce7" : meet.status === "cancelled" ? "#fee2e2" : "#f1f5f9",
                            color: meet.status === "completed" ? "#16a34a" : meet.status === "cancelled" ? "#ef4444" : "#64748b"
                          }}>{meet.status}</span>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            color: meet.priority === "mandatory" || meet.priority === "critical" ? "#ef4444" : "#64748b"
                          }}>{meet.priority?.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewMeetingDetails(meet); }}
                            style={{
                              background: "rgba(37,99,235,0.06)",
                              color: "#2563eb",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 10px",
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <LucideEye size={12} /> Audit
                          </button>
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

      {/* Audit Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedMeeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                width: "90%",
                maxWidth: "750px",
                maxHeight: "85vh",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                borderRadius: "24px",
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Header */}
              <div style={{
                padding: "20px 24px",
                borderBottom: "1.5px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc"
              }}>
                <div>
                  <span style={{
                    fontSize: "0.65rem",
                    background: selectedMeeting.priority === "mandatory" ? "#fee2e2" : "#f1f5f9",
                    color: selectedMeeting.priority === "mandatory" ? "#ef4444" : "#64748b",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontWeight: 800,
                    textTransform: "uppercase"
                  }}>{selectedMeeting.priority} Sync Audit</span>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 950, margin: "4px 0 0", color: "#0f172a" }}>{selectedMeeting.title}</h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Content */}
              <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Meeting Stats Overview */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                  <div style={{ background: "#ffffff", padding: "12px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>MEETING HOST</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#1e293b", marginTop: "2px", display: "block" }}>
                      {selectedMeeting.host?.name || "Host"}
                    </span>
                  </div>
                  <div style={{ background: "#ffffff", padding: "12px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>STATUS</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 900, color: selectedMeeting.status === "completed" ? "#16a34a" : "#ef4444", marginTop: "2px", display: "block", textTransform: "uppercase" }}>
                      {selectedMeeting.status}
                    </span>
                  </div>
                  <div style={{ background: "#ffffff", padding: "12px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>TOTAL DURATION</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#0284c7", marginTop: "2px", display: "block" }}>
                      {selectedMeeting.duration || 30} mins
                    </span>
                  </div>
                </div>

                {/* Agenda and Details */}
                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 850, textTransform: "uppercase", color: "#64748b", margin: "0 0 6px 0" }}>Agenda & Description</h4>
                  <p style={{ fontSize: "0.85rem", margin: 0, color: "#334155", lineHeight: "1.4" }}>
                    {selectedMeeting.agenda || "No official agenda set."}
                  </p>
                  {selectedMeeting.description && (
                    <p style={{ fontSize: "0.8rem", margin: "8px 0 0 0", color: "#64748b", fontStyle: "italic" }}>
                      {selectedMeeting.description}
                    </p>
                  )}
                  {selectedMeeting.cancellationReason && (
                    <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(239, 68, 68, 0.05)", borderLeft: "4px solid #ef4444", borderRadius: "8px" }}>
                      <strong style={{ fontSize: "0.75rem", color: "#ef4444", display: "block" }}>CANCELLATION REASON</strong>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{selectedMeeting.cancellationReason}</span>
                    </div>
                  )}
                </div>

                {/* AI Summary and Action Items */}
                {selectedMeeting.aiSummaryEnabled && (
                  <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: 850, textTransform: "uppercase", color: "#64748b", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                      <LucideZap size={14} style={{ color: "#eab308" }} /> AI Minutes & Action Items
                    </h4>
                    
                    {selectedMeeting.summary ? (() => {
                      try {
                        const parsed = typeof selectedMeeting.summary === "string" ? JSON.parse(selectedMeeting.summary) : selectedMeeting.summary;
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div>
                              <strong style={{ fontSize: "0.78rem", color: "#475569" }}>Highlights & Discussion:</strong>
                              <p style={{ fontSize: "0.8rem", margin: "2px 0 0", color: "#334155" }}>{parsed.highlights || "No highlights recorded."}</p>
                            </div>
                            {parsed.actionItems && parsed.actionItems.length > 0 && (
                              <div>
                                <strong style={{ fontSize: "0.78rem", color: "#475569" }}>Assigned Tasks:</strong>
                                <ul style={{ margin: "4px 0 0", paddingLeft: "20px", fontSize: "0.8rem", color: "#334155", display: "flex", flexDirection: "column", gap: "4px" }}>
                                  {parsed.actionItems.map((item: any, idx: number) => (
                                    <li key={idx}>
                                      <strong>{item.title}</strong> - Assigned to {item.assignee || "Unassigned"} (Due: {item.dueDate || "N/A"})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      } catch (e) {
                        return <p style={{ fontSize: "0.8rem", margin: 0, color: "#475569" }}>{selectedMeeting.summary}</p>;
                      }
                    })() : (
                      <p style={{ fontSize: "0.8rem", margin: 0, color: "#64748b", fontStyle: "italic" }}>
                        AI Summary was not generated for this meeting.
                      </p>
                    )}
                  </div>
                )}

                {/* Participant Connection Logs & Telemetry */}
                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 850, textTransform: "uppercase", color: "#64748b", margin: "0 0 10px 0" }}>
                    Attendance Telemetry & Engagement
                  </h4>
                  
                  {!selectedMeeting.attendances || selectedMeeting.attendances.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", margin: 0, color: "#64748b", fontStyle: "italic" }}>
                      No participant attendance logs were recorded for this meeting.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedMeeting.attendances.map((att: any) => {
                        const durationMins = Math.floor((att.duration || 0) / 60);
                        const durationSecs = (att.duration || 0) % 60;
                        const formattedDuration = `${durationMins}m ${durationSecs}s`;

                        return (
                          <div key={att.id} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 12px",
                            background: "#f8fafc",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0"
                          }}>
                            <div>
                              <strong style={{ fontSize: "0.82rem", color: "#1e293b" }}>{att.user?.name || `User ID: ${att.userId}`}</strong>
                              <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>
                                Role: {att.user?.role?.toUpperCase() || "RECRUITER"} • Status: 
                                <strong style={{
                                  color: att.status === "joined" || att.status === "completed" ? "#16a34a" : "#ef4444",
                                  marginLeft: "4px"
                                }}>{att.status?.toUpperCase()}</strong>
                              </span>
                            </div>

                            <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "0.75rem", color: "#475569" }}>
                              {att.rejected ? (
                                <div style={{ textAlign: "right" }}>
                                  <span style={{ color: "#ef4444", fontWeight: 800 }}>REJECTED CALL</span>
                                  <span style={{ fontSize: "0.65rem", display: "block", color: "#64748b" }}>Reason: {att.rejectReason || "None"}</span>
                                </div>
                              ) : (
                                <>
                                  <div style={{ textAlign: "center" }}>
                                    <span style={{ color: "#94a3b8", display: "block", fontSize: "0.6rem", fontWeight: 800 }}>CAMERA</span>
                                    <strong>{Math.round(att.cameraUsage || 0)}%</strong>
                                  </div>
                                  <div style={{ textAlign: "center" }}>
                                    <span style={{ color: "#94a3b8", display: "block", fontSize: "0.6rem", fontWeight: 800 }}>MIC</span>
                                    <strong>{Math.round(att.micUsage || 0)}%</strong>
                                  </div>
                                  <div style={{ textAlign: "center" }}>
                                    <span style={{ color: "#94a3b8", display: "block", fontSize: "0.6rem", fontWeight: 800 }}>DURATION</span>
                                    <strong>{formattedDuration}</strong>
                                  </div>
                                  {att.networkDisconnects > 0 && (
                                    <div style={{ textAlign: "center" }}>
                                      <span style={{ color: "#ef4444", display: "block", fontSize: "0.6rem", fontWeight: 800 }}>DROPS</span>
                                      <strong style={{ color: "#ef4444" }}>{att.networkDisconnects}</strong>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: "16px 24px",
                borderTop: "1.5px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                background: "#f8fafc"
              }}>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="btn-secondary"
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  Dismiss Audit Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
