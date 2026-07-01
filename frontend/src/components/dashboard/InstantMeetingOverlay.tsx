import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LucideVideo, LucideX, LucideBell, LucideCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InstantMeetingOverlayProps {
  currentUser: {
    id: number;
    name: string;
    role: string;
    companyId: number;
  } | null;
  role: "superadmin" | "boss" | "manager" | "tl" | "recruiter";
}

export default function InstantMeetingOverlay({ currentUser, role }: InstantMeetingOverlayProps) {
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || role === "superadmin") return;

    const pollAlerts = async () => {
      try {
        const res = await fetch("/api/meetings/active-alerts");
        if (res.ok) {
          const data = await res.json();
          // Verify if there is an active instant meeting that this user hasn't joined/rejected yet
          if (data.activeInstantMeeting) {
            setActiveMeeting(data.activeInstantMeeting);
          } else {
            setActiveMeeting(null);
          }
        }
      } catch (err) {
        console.error("Error polling active alerts", err);
      }
    };

    pollAlerts();
    const interval = setInterval(pollAlerts, 1000);
    return () => clearInterval(interval);
  }, [currentUser, role]);

  if (!activeMeeting) return null;

  const hostName = activeMeeting.host?.name || "Someone";
  const hostRole = activeMeeting.host?.role || "TL";
  const title = activeMeeting.title || "Instant Live Meeting";
  const meetingId = activeMeeting.id;

  // Rejection rules:
  // Boss scheduled meeting: NOBODY can reject.
  // Manager scheduled meeting: Boss can reject.
  // TL scheduled meeting: Boss can reject, Manager can reject.
  // Recruiters cannot reject any meetings.
  let isRejectAllowed = false;
  if (role === "boss") {
    isRejectAllowed = true;
  } else if (role === "manager" && hostRole === "tl") {
    isRejectAllowed = true;
  } else if (role === "tl" && hostRole === "tl") {
    isRejectAllowed = true;
  }

  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/join`, { method: "POST" });
      if (res.ok) {
        setActiveMeeting(null);
        navigate(`/dashboard/${role}/meetings?room=${meetingId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a cancellation/rejection reason.");
      return;
    }
    try {
      const res = await fetch(`/api/meetings/${meetingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setActiveMeeting(null);
        setRejecting(false);
        setRejectReason("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)",
            width: "100%",
            maxWidth: "460px",
            padding: "32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px"
          }}
        >
          {/* Animated pulsing video camera icon */}
          <div style={{ position: "relative", marginBottom: "10px" }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: -10, left: -10, right: -10, bottom: -10,
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                zIndex: 0
              }}
            />
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 8px 20px rgba(239, 68, 68, 0.3)",
                position: "relative",
                zIndex: 1
              }}
            >
              <LucideVideo size={36} className="animate-pulse" />
            </div>
            <span
              style={{
                position: "absolute",
                bottom: -5,
                right: -5,
                background: "#ffffff",
                border: "2px solid #ef4444",
                color: "#ef4444",
                fontSize: "0.6rem",
                fontWeight: 900,
                padding: "2px 8px",
                borderRadius: "10px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                zIndex: 2
              }}
            >
              Live Now
            </span>
          </div>

          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>
              {hostName} <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700 }}>({hostRole.toUpperCase()})</span>
            </h2>
            <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#475569", margin: "0 0 16px 0" }}>
              is calling you to an instant live meeting.
            </p>
            <div
              style={{
                background: "#f1f5f9",
                borderRadius: "12px",
                padding: "12px 18px",
                border: "1.5px dashed #cbd5e1"
              }}
            >
              <h3 style={{ fontSize: "0.85rem", fontWeight: 900, color: "#1e293b", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Meeting Topic
              </h3>
              <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2563eb", margin: 0 }}>
                "{title}"
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", marginTop: "10px" }}>
            {!rejecting ? (
              <>
                <button
                  onClick={handleJoin}
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 28px",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.25)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <LucideCheck size={18} /> Join Meeting
                </button>

                {isRejectAllowed && (
                  <button
                    onClick={() => setRejecting(true)}
                    style={{
                      background: "none",
                      border: "1.5px solid #ef4444",
                      color: "#ef4444",
                      borderRadius: "12px",
                      padding: "12px 28px",
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    Reject Invitation
                  </button>
                )}
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <textarea
                  placeholder="Enter rejection reason (mandatory)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    padding: "10px",
                    fontSize: "0.85rem",
                    outline: "none",
                    fontWeight: 600,
                    resize: "none"
                  }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleReject}
                    style={{
                      flex: 1,
                      background: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => {
                      setRejecting(false);
                      setRejectReason("");
                    }}
                    style={{
                      flex: 1,
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
