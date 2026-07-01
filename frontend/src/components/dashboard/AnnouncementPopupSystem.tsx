import React from "react";
import { LucideMegaphone, LucideX, LucidePaperclip } from "lucide-react";
import { motion } from "framer-motion";

export default function AnnouncementPopupSystem() {
  const [activeAnnouncement, setActiveAnnouncement] = React.useState<any>(null);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [manualText, setManualText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [reactionSelected, setReactionSelected] = React.useState("");

  const fetchUnreadAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements/unread");
      if (res.ok) {
        const unreads = await res.json();
        if (Array.isArray(unreads) && unreads.length > 0) {
          const nextAnn = unreads[0];
          if (!activeAnnouncement || activeAnnouncement.announcementId !== nextAnn.announcementId) {
            setActiveAnnouncement(nextAnn);
            setSelectedOptions([]);
            setManualText("");
            setReactionSelected("");
            
            fetch(`/api/announcements/${nextAnn.announcementId}/status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "seen" })
            }).catch(err => console.error("Failed to mark announcement seen", err));
          }
        } else {
          setActiveAnnouncement(null);
        }
      }
    } catch (err) {
      console.error("Failed to poll unread announcements:", err);
    }
  };

  React.useEffect(() => {
    fetchUnreadAnnouncements();
    const timer = setInterval(fetchUnreadAnnouncements, 4000);
    return () => clearInterval(timer);
  }, [activeAnnouncement]);

  const handleSelectOption = (opt: string) => {
    if (activeAnnouncement.type === "poll" || activeAnnouncement.type === "mixed") {
      setSelectedOptions([opt]); 
    }
  };

  const handleSendReaction = async (emoji: string) => {
    if (!activeAnnouncement) return;
    setReactionSelected(emoji);
    try {
      await fetch(`/api/announcements/${activeAnnouncement.announcementId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: emoji })
      });
    } catch (err) {
      console.error("Failed to post reaction:", err);
    }
  };

  const handleSubmitResponse = async () => {
    if (!activeAnnouncement) return;
    
    const isPoll = ["poll", "mixed"].includes(activeAnnouncement.type);
    const isManual = ["manual", "mixed"].includes(activeAnnouncement.type) || activeAnnouncement.allowManual;

    if (isPoll && selectedOptions.length === 0) {
      alert("Please select a poll option to submit.");
      return;
    }
    if (isManual && activeAnnouncement.responseRequired && !manualText.trim()) {
      alert("Please enter a custom text reply to submit.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/announcements/${activeAnnouncement.announcementId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOptions: isPoll ? selectedOptions : null,
          manualText: isManual ? manualText : null
        })
      });

      if (res.ok) {
        setActiveAnnouncement(null);
        fetchUnreadAnnouncements();
      } else {
        alert("Failed to submit response. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network failure while submitting response.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIgnore = async () => {
    if (!activeAnnouncement) return;
    if (activeAnnouncement.responseRequired) {
      alert("Response is compulsory. You cannot dismiss this alert.");
      return;
    }

    try {
      await fetch(`/api/announcements/${activeAnnouncement.announcementId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ignored" })
      });
      setActiveAnnouncement(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeAnnouncement) return null;

  const priorityStyle = (() => {
    switch (activeAnnouncement.priority) {
      case "critical":
        return {
          border: "2.5px solid #ec4899",
          badgeBg: "#fce7f3",
          badgeText: "#db2777",
          titleColor: "#be185d",
          accentColor: "#ec4899",
          glow: "0 0 16px rgba(236, 72, 153, 0.4)"
        };
      case "urgent":
        return {
          border: "2.5px solid #ef4444",
          badgeBg: "#fee2e2",
          badgeText: "#dc2626",
          titleColor: "#b91c1c",
          accentColor: "#ef4444",
          glow: "0 0 16px rgba(239, 68, 68, 0.4)"
        };
      case "important":
        return {
          border: "2px solid #f59e0b",
          badgeBg: "#fef3c7",
          badgeText: "#d97706",
          titleColor: "#b45309",
          accentColor: "#f59e0b",
          glow: "0 0 10px rgba(245, 158, 11, 0.25)"
        };
      default:
        return {
          border: "1.5px solid #3b82f6",
          badgeBg: "#dbeafe",
          badgeText: "#2563eb",
          titleColor: "#1d4ed8",
          accentColor: "#3b82f6",
          glow: "0 4px 20px rgba(0, 0, 0, 0.08)"
        };
    }
  })();

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: activeAnnouncement.responseRequired ? "rgba(15, 23, 42, 0.7)" : "rgba(15, 23, 42, 0.2)",
      backdropFilter: activeAnnouncement.responseRequired ? "blur(8px)" : "blur(2px)",
      zIndex: 200000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        style={{
          background: "#ffffff",
          width: "90%",
          maxWidth: "480px",
          borderRadius: "20px",
          border: priorityStyle.border,
          boxShadow: priorityStyle.glow,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{
          padding: "16px 20px",
          background: `linear-gradient(135deg, ${priorityStyle.accentColor} 0%, #1e293b 100%)`,
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LucideMegaphone size={16} />
            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
              {activeAnnouncement.priority} alert
            </span>
          </div>

        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>
              Sender: <span style={{ color: "#0f172a" }}>{activeAnnouncement.senderName}</span>
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {new Date(activeAnnouncement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: "900", color: priorityStyle.titleColor }}>
              {activeAnnouncement.title}
            </h3>
            <p style={{ margin: 0, fontSize: "0.92rem", color: "#334155", lineHeight: "1.5", whiteSpace: "pre-line" }}>
              {activeAnnouncement.message}
            </p>
          </div>

          {activeAnnouncement.attachments && activeAnnouncement.attachments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "800", textTransform: "uppercase" }}>Relevant Attachments</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {activeAnnouncement.attachments.map((file: any, idx: number) => (
                  <a 
                    key={idx}
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                      fontSize: "11px",
                      color: "#2563eb",
                      textDecoration: "none",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "600"
                    }}
                  >
                    <LucidePaperclip size={10} />
                    {file.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {["poll", "mixed"].includes(activeAnnouncement.type) && activeAnnouncement.options.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", textTransform: "uppercase" }}>Select Option *</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {activeAnnouncement.options.map((opt: string, idx: number) => {
                  const isSelected = selectedOptions.includes(opt);
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      style={{
                        padding: "10px 14px",
                        background: isSelected ? "rgba(37,99,235,0.06)" : "#f8fafc",
                        border: `1.5px solid ${isSelected ? "#3b82f6" : "#e2e8f0"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        color: isSelected ? "#1d4ed8" : "#334155",
                        fontWeight: isSelected ? "700" : "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "all 0.15s"
                      }}
                    >
                      <span style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        border: `1.5px solid ${isSelected ? "#3b82f6" : "#94a3b8"}`,
                        background: isSelected ? "#3b82f6" : "transparent",
                        display: "inline-block",
                        boxShadow: isSelected ? "0 0 4px rgba(59,130,246,0.5)" : "none"
                      }} />
                      {opt}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(["manual", "mixed"].includes(activeAnnouncement.type) || activeAnnouncement.allowManual) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", textTransform: "uppercase" }}>
                Type Reply {activeAnnouncement.responseRequired ? "*" : "(Optional)"}
              </span>
              <textarea 
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Type your response/reason here..."
                style={{ width: "100%", height: "60px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", resize: "none" }}
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>React</span>
            <div style={{ display: "flex", gap: "6px" }}>
              {["👍", "❤️", "😮", "🔥", "👏", "🎉"].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  style={{
                    background: reactionSelected === emoji ? "rgba(37,99,235,0.12)" : "none",
                    border: reactionSelected === emoji ? "1px solid rgba(37,99,235,0.3)" : "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    padding: "3px 6px",
                    borderRadius: "4px",
                    transition: "transform 0.1s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            {!activeAnnouncement.responseRequired && (
              <button 
                type="button"
                onClick={handleIgnore}
                style={{
                  flex: 1,
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Acknowledge / Dismiss
              </button>
            )}
            
            {(activeAnnouncement.responseRequired || ["poll", "manual", "mixed"].includes(activeAnnouncement.type)) && (
              <button 
                type="button"
                onClick={handleSubmitResponse}
                disabled={submitting}
                style={{
                  flex: 2,
                  background: `linear-gradient(135deg, ${priorityStyle.accentColor} 0%, #1e293b 100%)`,
                  border: "none",
                  color: "#ffffff",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? "Submitting response..." : "Submit Response & Clear"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
