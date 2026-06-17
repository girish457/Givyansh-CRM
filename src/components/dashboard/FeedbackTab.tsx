import React, { useState, useEffect, useRef } from "react";
import {
  LucideMessageSquare,
  LucideSend,
  LucideClock,
  LucideAlertTriangle,
  LucideCheckCircle2,
  LucideLock,
  LucideInfo,
  LucideHistory,
  LucideX,
  LucideCornerDownLeft,
  LucideChevronRight,
  LucideEye,
  LucideUserCheck,
  LucideUserX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackTabProps {
  currentUser: any;
}

export default function FeedbackTab({ currentUser }: FeedbackTabProps) {
  // Form State
  const [feedbackType, setFeedbackType] = useState("Feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [sendTo, setSendTo] = useState<string[]>(["Team Leader"]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Eligibility / State
  const [eligibility, setEligibility] = useState({
    isEligible: false,
    reason: "Loading eligibility details...",
    completedHours: "0.00",
    requiredHours: 8.0,
    completedPercent: 0,
    alreadySubmittedToday: false
  });
  const [loadingEligibility, setLoadingEligibility] = useState(true);

  // Navigation
  const [historyTab, setHistoryTab] = useState<"Sent" | "Read" | "Replied">("Sent");
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [conversationReplies, setConversationReplies] = useState<any[]>([]);
  const [newReplyText, setNewReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Popups & Animation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Fetch Eligibility and History
  const checkEligibility = async () => {
    try {
      const res = await fetch("/api/feedback/eligibility");
      if (res.ok) {
        const data = await res.json();
        setEligibility(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEligibility(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/feedback/history");
      if (res.ok) {
        const data = await res.json();
        setMyHistory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    checkEligibility();
    fetchHistory();
    // Real-time calculation syncing
    const eligibilityInterval = setInterval(checkEligibility, 20000);
    return () => clearInterval(eligibilityInterval);
  }, []);

  const handleSendToToggle = (role: string) => {
    if (sendTo.includes(role)) {
      if (sendTo.length > 1) {
        setSendTo(sendTo.filter(r => r !== role));
      }
    } else {
      setSendTo([...sendTo, role]);
    }
  };

  // Submit flow
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert("Subject and Message fields are required.");
      return;
    }
    submitFeedbackToBackend();
  };

  const submitFeedbackToBackend = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType,
          subject,
          message,
          priority,
          sendTo,
          isAnonymous
        })
      });

      if (res.ok) {
        setShowSuccessToast(true);
        // Reset composer
        setSubject("");
        setMessage("");
        setFeedbackType("Feedback");
        setPriority("Medium");
        setSendTo(["Team Leader"]);
        setIsAnonymous(false);
        
        // Refresh eligibility and history
        checkEligibility();
        fetchHistory();

        setTimeout(() => {
          setShowSuccessToast(false);
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit feedback.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Conversation/Replies View
  const handleSelectFeedback = async (feedback: any) => {
    setSelectedFeedback(feedback);
    setNewReplyText("");
    try {
      const res = await fetch(`/api/feedback/${feedback.id}/replies`);
      if (res.ok) {
        const data = await res.json();
        setConversationReplies(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim() || !selectedFeedback) return;
    setSendingReply(true);

    try {
      const res = await fetch(`/api/feedback/${selectedFeedback.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newReplyText })
      });

      if (res.ok) {
        setNewReplyText("");
        // Reload replies
        const repliesRes = await fetch(`/api/feedback/${selectedFeedback.id}/replies`);
        if (repliesRes.ok) {
          setConversationReplies(await repliesRes.json());
        }
        // Refresh history status list
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingReply(false);
    }
  };

  // Filtering local history
  const filteredHistory = myHistory.filter(f => {
    if (historyTab === "Sent") return f.status === "Sent";
    if (historyTab === "Read") return f.status === "Read";
    return f.status === "Replied";
  });

  const getRecipientSummary = (f: any) => {
    const arr = [];
    if (f.toTL) arr.push("TL");
    if (f.toManager) arr.push("Manager");
    if (f.toBoss) arr.push("Boss");
    return arr.join(" + ");
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Critical": return "#ef4444";
      case "High": return "#f97316";
      case "Medium": return "#3b82f6";
      default: return "#10b981";
    }
  };

  const getPriorityBadgeStyle = (p: string) => {
    switch (p) {
      case "Critical": return { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" };
      case "High": return { background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa" };
      case "Medium": return { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" };
      default: return { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" };
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px", padding: "16px", fontFamily: "Inter, -apple-system, sans-serif", height: "100%", background: "#f1f5f9", overflowY: "auto" }}>
      
      {/* LEFT COLUMN: Feedback Composer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Sleek, Gradient Header with Status */}
        <div style={{
          background: eligibility.isEligible 
            ? "linear-gradient(135deg, #059669 0%, #10b981 100%)" 
            : "linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)",
          color: "white",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 15px -3px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Subtle lighting design effect */}
          <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", background: "rgba(255,255,255,0.15)", borderRadius: "50%" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.2)", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {eligibility.isEligible ? <LucideUserCheck size={20} /> : <LucideLock size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em" }}>Shift Eligibility Node</h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: "0.76rem" }}>
                {eligibility.isEligible ? "Composer Access Unlocked" : "Composer Locked (Awaiting Shift Hours)"}
              </p>
            </div>
          </div>

          <div style={{ fontSize: "0.78rem", fontWeight: 500, background: "rgba(0,0,0,0.15)", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
            {loadingEligibility ? "Verifying shift logs..." : eligibility.reason}
          </div>

          {!loadingEligibility && currentUser?.role === "recruiter" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700 }}>
                <span>Worked Hours: {eligibility.completedHours} / {eligibility.requiredHours} hrs</span>
                <span>{eligibility.completedPercent}%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.25)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(eligibility.completedPercent, 100)}%`, height: "100%", background: "white", borderRadius: "100px" }} />
              </div>
            </div>
          )}
        </div>

        {/* FEEDBACK COMPOSER FORM */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px -3px rgba(0, 0, 0, 0.05)",
          opacity: eligibility.isEligible ? 1 : 0.65,
          pointerEvents: eligibility.isEligible ? "auto" : "none",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <LucideMessageSquare size={18} color="#2563eb" /> Feedback Gateway
          </h3>

          <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Type Select */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Feedback Type</label>
                <select
                  value={feedbackType}
                  onChange={e => setFeedbackType(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.82rem", fontWeight: 600, color: "#1e293b", background: "#f8fafc", cursor: "pointer", transition: "border-color 0.2s" }}
                >
                  <option value="Feedback">Feedback</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Appreciation">Appreciation</option>
                  <option value="Thank You">Thank You</option>
                  <option value="Improvement Idea">Improvement Idea</option>
                  <option value="Workplace Concern">Workplace Concern</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Priority Select */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Priority Rank</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.82rem", fontWeight: 600, color: "#1e293b", background: "#f8fafc", cursor: "pointer", transition: "border-color 0.2s" }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Subject</label>
              <input
                type="text"
                placeholder="Enter feedback subject header..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.82rem", color: "#1e293b", transition: "border-color 0.2s" }}
                required
              />
            </div>

            {/* Message Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Detailed Message</label>
              <textarea
                rows={4}
                placeholder="Write message contents securely here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.82rem", color: "#1e293b", resize: "none", lineHeight: 1.4, transition: "border-color 0.2s" }}
                required
              />
            </div>

            {/* Target Select */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Send To Recipients</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["Team Leader", "Manager", "Boss"].map(role => {
                  const active = sendTo.includes(role);
                  return (
                    <button
                      type="button"
                      key={role}
                      onClick={() => handleSendToToggle(role)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "6px",
                        border: active ? "1px solid transparent" : "1px solid #cbd5e1",
                        background: active ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "transparent",
                        color: active ? "white" : "#64748b",
                        fontWeight: 700,
                        fontSize: "0.76rem",
                        cursor: "pointer",
                        boxShadow: active ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                        transition: "all 0.2s"
                      }}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8fafc",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <div>
                <strong style={{ display: "block", fontSize: "0.78rem", color: "#1e293b" }}>Send Anonymously</strong>
                <span style={{ fontSize: "0.66rem", color: "#64748b" }}>Your identity will be masked</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                  width: "38px",
                  height: "20px",
                  borderRadius: "100px",
                  background: isAnonymous ? "#10b981" : "#cbd5e1",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: "3px",
                  left: isAnonymous ? "21px" : "3px",
                  transition: "all 0.2s"
                }}></div>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
            >
              <LucideSend size={14} /> {isSubmitting ? "Sending..." : "Submit Feedback"}
            </button>

          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: Feedback History */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", boxShadow: "0 4px 20px -3px rgba(0, 0, 0, 0.05)", height: "100%", overflowY: "auto" }}>
        
        {selectedFeedback ? (
          /* CONVERSATION VIEW */
          <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <button
                onClick={() => setSelectedFeedback(null)}
                style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                &larr; Back to History
              </button>
              <span style={{ fontSize: "0.72rem", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                ID: #{selectedFeedback.id}
              </span>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "0.68rem", background: "#eff6ff", color: "#2563eb", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                  {selectedFeedback.feedbackType}
                </span>
                <span style={{ 
                  fontSize: "0.68rem", 
                  background: getPriorityBadgeStyle(selectedFeedback.priority).background, 
                  color: getPriorityBadgeStyle(selectedFeedback.priority).color, 
                  border: getPriorityBadgeStyle(selectedFeedback.priority).border,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: 700
                }}>
                  {selectedFeedback.priority} Priority
                </span>
              </div>
              <h3 style={{ margin: "4px 0 4px", fontWeight: 800, color: "#0f172a", fontSize: "0.9rem" }}>{selectedFeedback.subject}</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569", lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{selectedFeedback.message}</p>
              
              <div style={{ marginTop: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                <span>To: <strong style={{ color: "#475569" }}>{getRecipientSummary(selectedFeedback)}</strong></span>
                <span style={{ textAlign: "right" }}>Sent: <strong>{new Date(selectedFeedback.createdAt).toLocaleDateString()}</strong></span>
              </div>
            </div>

            {/* AUDIT STATUS ROW */}
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "8px 12px" }}>
              <h4 style={{ margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Recipient Read Status</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.68rem" }}>
                {selectedFeedback.toTL && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: selectedFeedback.readByTL ? "#16a34a" : "#64748b", fontWeight: 700 }}>TL:</span>
                    <span style={{ 
                      color: selectedFeedback.readByTL ? "#15803d" : "#475569", 
                      background: selectedFeedback.readByTL ? "#dcfce7" : "#f1f5f9",
                      padding: "1px 6px",
                      borderRadius: "4px"
                    }}>
                      {selectedFeedback.readByTL ? `Read (${new Date(selectedFeedback.readByTLAt).toLocaleDateString()})` : "Unread"}
                    </span>
                  </div>
                )}
                {selectedFeedback.toManager && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: selectedFeedback.readByManager ? "#16a34a" : "#64748b", fontWeight: 700 }}>Manager:</span>
                    <span style={{ 
                      color: selectedFeedback.readByManager ? "#15803d" : "#475569", 
                      background: selectedFeedback.readByManager ? "#dcfce7" : "#f1f5f9",
                      padding: "1px 6px",
                      borderRadius: "4px"
                    }}>
                      {selectedFeedback.readByManager ? `Read (${new Date(selectedFeedback.readByManagerAt).toLocaleDateString()})` : "Unread"}
                    </span>
                  </div>
                )}
                {selectedFeedback.toBoss && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: selectedFeedback.readByBoss ? "#16a34a" : "#64748b", fontWeight: 700 }}>Boss:</span>
                    <span style={{ 
                      color: selectedFeedback.readByBoss ? "#15803d" : "#475569", 
                      background: selectedFeedback.readByBoss ? "#dcfce7" : "#f1f5f9",
                      padding: "1px 6px",
                      borderRadius: "4px"
                    }}>
                      {selectedFeedback.readByBoss ? `Read (${new Date(selectedFeedback.readByBossAt).toLocaleDateString()})` : "Unread"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CHAT/CONVERSATION TIMELINE */}
            <div style={{ flex: 1, minHeight: "100px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", padding: "8px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              {conversationReplies.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
                  No replies yet on this thread.
                </div>
              ) : (
                conversationReplies.map((reply) => {
                  const isMe = reply.senderRole === "recruiter";
                  return (
                    <div
                      key={reply.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        background: isMe ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "#ffffff",
                        color: isMe ? "white" : "#1e293b",
                        border: isMe ? "none" : "1px solid #e2e8f0",
                        padding: "8px 10px",
                        borderRadius: isMe ? "8px 8px 0 8px" : "8px 8px 8px 0",
                        boxShadow: isMe ? "0 2px 6px rgba(37,99,235,0.15)" : "0 1px 3px rgba(0,0,0,0.02)"
                      }}
                    >
                      <span style={{ fontSize: "0.64rem", fontWeight: 700, opacity: 0.85, marginBottom: "2px" }}>
                        {isMe ? (selectedFeedback.isAnonymous ? "Anonymous (You)" : reply.sender?.name) : `${reply.sender?.name} (${reply.senderRole.toUpperCase()})`}
                      </span>
                      <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: 1.3 }}>{reply.message}</p>
                      <span style={{ fontSize: "0.58rem", opacity: 0.7, textAlign: "right", display: "block", marginTop: "3px" }}>
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* REPLY COMPOSER FORM */}
            <form onSubmit={handleSendReply} style={{ display: "flex", gap: "6px" }}>
              <input
                type="text"
                value={newReplyText}
                onChange={e => setNewReplyText(e.target.value)}
                placeholder="Type reply message..."
                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.78rem", outline: "none" }}
              />
              <button
                type="submit"
                disabled={sendingReply}
                style={{ padding: "8px 16px", borderRadius: "8px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 700, boxShadow: "0 2px 6px rgba(37,99,235,0.2)" }}
              >
                <LucideCornerDownLeft size={12} /> Send
              </button>
            </form>

          </div>
        ) : (
          /* HISTORY LIST VIEW */
          <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <LucideHistory size={18} color="#64748b" /> Feedback History
            </h3>

            {/* Inner Tabs */}
            <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px", gap: "4px" }}>
              {(["Sent", "Read", "Replied"] as const).map(tab => {
                const active = historyTab === tab;
                const count = myHistory.filter(f => f.status === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setHistoryTab(tab)}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: active ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "transparent",
                      color: active ? "white" : "#64748b",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: active ? "0 2px 8px rgba(37,99,235,0.2)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    {tab}
                    <span style={{ fontSize: "0.68rem", background: active ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)", color: active ? "white" : "#64748b", padding: "1px 6px", borderRadius: "100px", fontWeight: 800 }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {loadingHistory ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                  Syncing feedback history...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                  No records found.
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const badgeStyle = getPriorityBadgeStyle(item.priority);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectFeedback(item)}
                      style={{
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "#bfdbfe";
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.68rem", background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          {item.feedbackType}
                        </span>
                        <span style={{ fontSize: "0.68rem", background: badgeStyle.background, color: badgeStyle.color, border: badgeStyle.border, padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          {item.priority}
                        </span>
                      </div>

                      <h4 style={{ margin: "0 0 4px", fontWeight: 700, color: "#1e293b", fontSize: "0.85rem" }}>{item.subject}</h4>
                      <p style={{ margin: "0 0 8px", fontSize: "0.78rem", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {item.message}
                      </p>

                      <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.68rem", color: "#94a3b8" }}>
                        <span>To: <strong style={{ color: "#475569" }}>{getRecipientSummary(item)}</strong></span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* Floating Success Toast */}
      {showSuccessToast && (
        <div style={{
          position: "fixed",
          bottom: "15px",
          right: "15px",
          background: "#10b981",
          color: "white",
          padding: "8px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: 700,
          fontSize: "0.75rem",
          zIndex: 10000
        }}>
          <LucideCheckCircle2 size={14} />
          Feedback sent successfully!
        </div>
      )}

    </div>
  );
}
