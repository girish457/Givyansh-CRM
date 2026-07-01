import React, { useState, useEffect, useRef } from "react";
import {
  LucideFileLock,
  LucideDownload,
  LucideEye,
  LucideCheck,
  LucideAlertTriangle,
  LucideBuilding,
  LucideBookOpen,
  LucideExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

interface PolicyAcknowledgementPopupProps {
  pendingPolicies: any[];
  onComplete: () => void;
}

export default function PolicyAcknowledgementPopup({
  pendingPolicies,
  onComplete
}: PolicyAcknowledgementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPolicy = pendingPolicies[currentIndex];

  // Reading Tracker States
  const [secondsRemaining, setSecondsRemaining] = useState(15); // 15-second minimum duration
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewedDocs, setViewedDocs] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize tracker for the current policy
  useEffect(() => {
    if (!currentPolicy) return;
    
    setSecondsRemaining(15);
    setScrollProgress(0);
    setViewedDocs([]);
    setAgreed(false);

    // Call API 'open' action to audit log the open event
    fetch(`/api/policies/${currentPolicy.id}/acknowledgement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open" })
    });

    // Start countdown timer
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        
        // Report progress every 3 seconds
        if (prev % 3 === 0) {
          reportProgress();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, currentPolicy]);

  const reportProgress = async () => {
    if (!currentPolicy) return;
    try {
      await fetch(`/api/policies/${currentPolicy.id}/acknowledgement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "progress",
          readDuration: 3,
          scrollProgress: scrollProgress,
          pagesViewed: 1
        })
      });
    } catch (e) {
      console.error("Failed to report reading progress:", e);
    }
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const totalHeight = el.scrollHeight - el.clientHeight;
    if (totalHeight <= 0) {
      setScrollProgress(100);
      return;
    }

    const pct = (el.scrollTop / totalHeight) * 100;
    setScrollProgress(Math.min(pct, 100));
  };

  const handleViewDocument = async (docName: string, docUrl: string) => {
    if (!viewedDocs.includes(docName)) {
      setViewedDocs(prev => [...prev, docName]);
    }
    // Log open/view progress
    try {
      await fetch(`/api/policies/${currentPolicy.id}/acknowledgement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "progress",
          documentName: docName
        })
      });
    } catch (e) {
      console.error(e);
    }
    window.open(docUrl, "_blank");
  };

  const handleDownloadLog = async (docName: string, docUrl: string) => {
    try {
      await fetch(`/api/policies/${currentPolicy.id}/download-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: docName })
      });
    } catch (e) {
      console.error(e);
    }
    // Trigger download
    const link = document.createElement("a");
    link.href = docUrl;
    link.download = docName;
    link.click();
  };

  const handleAgreeAndContinue = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    try {
      // Final progress tracking ping
      await fetch(`/api/policies/${currentPolicy.id}/acknowledgement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "progress",
          readDuration: 15 - secondsRemaining,
          scrollProgress: 100,
          pagesViewed: 1
        })
      });

      // Submit agreement
      const res = await fetch(`/api/policies/${currentPolicy.id}/acknowledgement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" })
      });

      if (res.ok) {
        if (currentIndex + 1 < pendingPolicies.length) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onComplete();
        }
      } else {
        alert("Failed to submit acknowledgement.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentPolicy) return null;

  let docsList: any[] = [];
  try {
    docsList = JSON.parse(currentPolicy.documents || "[]");
  } catch (e) {
    docsList = [];
  }

  // Conditions for enabling the checkbox:
  // 1. Timer completed (0 seconds remaining)
  // 2. Scrolled at least 80% (or if height is too small to scroll)
  // 3. Opened the main document if documents exist
  const isTimerDone = secondsRemaining === 0;
  const isScrolledDone = scrollProgress >= 80 || (scrollContainerRef.current && scrollContainerRef.current.scrollHeight <= scrollContainerRef.current.clientHeight + 10);
  const isDocsOpened = docsList.length === 0 || viewedDocs.length > 0;
  const canAgree = isTimerDone && isScrolledDone && isDocsOpened;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(8px)",
        zIndex: 999999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        padding: "20px"
      }}
    >
      <div
        className="glass-card"
        style={{
          background: "white",
          borderRadius: "28px",
          width: "800px",
          maxWidth: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.2)"
        }}
      >
        {/* Compliance Lockdown Alert Banner */}
        <div style={{
          background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
          color: "white",
          padding: "12px 24px",
          fontSize: "0.85rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <LucideAlertTriangle size={16} />
          <span>PORTAL LOCKED: Mandatory Compliance Action Required (Policy {currentIndex + 1} of {pendingPolicies.length})</span>
        </div>

        {/* Policy Header info */}
        <div style={{ padding: "24px 30px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#ef4444", textTransform: "uppercase", letterSpacing: "1px" }}>
                {currentPolicy.severityLevel} SEVERITY COMPLIANCE
              </span>
              <h1 style={{ margin: "4px 0 6px 0", fontSize: "1.6rem", fontWeight: 900, color: "#1e293b" }}>
                {currentPolicy.title}
              </h1>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                Version: {currentPolicy.version} | Effective: {currentPolicy.effectiveDate ? new Date(currentPolicy.effectiveDate).toLocaleDateString() : "Immediate"} | Assigned By: {currentPolicy.createdByName}
              </span>
            </div>
            <div style={{
              background: "#eff6ff",
              color: "#2563eb",
              borderRadius: "14px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <LucideBuilding size={20} />
              <strong style={{ fontSize: "0.9rem", fontWeight: 800 }}>Fast RMS</strong>
            </div>
          </div>
        </div>

        {/* Scrollable Policy Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "30px",
            background: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box"
          }}
        >
          {/* Policy Summary / Description */}
          <div style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <LucideBookOpen size={18} style={{ color: "#2563eb" }} />
              Policy Summary
            </h3>
            <p style={{ margin: 0, fontSize: "0.92rem", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {currentPolicy.description || "Please review the documents below."}
            </p>
          </div>

          {/* Guidelines Documents List */}
          {docsList.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ margin: "0", fontSize: "0.95rem", fontWeight: 800, color: "#475569" }}>
                Mandatory Documentation & Process Guides
              </h3>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.8rem", color: "#64748b" }}>
                You must open and review at least one document to unlock acknowledgement.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {docsList.map((doc: any, dIdx: number) => {
                  const isOpened = viewedDocs.includes(doc.name);
                  return (
                    <div
                      key={dIdx}
                      style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "14px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>{doc.name}</strong>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8" }}>{doc.docType}</span>
                      </div>
                      
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleViewDocument(doc.name, doc.url)}
                          style={{
                            background: isOpened ? "#ecfdf5" : "#eff6ff",
                            color: isOpened ? "#10b981" : "#2563eb",
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 16px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <LucideEye size={14} />
                          {isOpened ? "Viewed" : "View Document"}
                        </button>
                        <button
                          onClick={() => handleDownloadLog(doc.name, doc.url)}
                          style={{
                            background: "#f1f5f9",
                            color: "#475569",
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px",
                            cursor: "pointer"
                          }}
                        >
                          <LucideDownload size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reading Telemetry Panel */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            background: "#f1f5f9",
            padding: "16px",
            borderRadius: "16px",
            fontSize: "0.8rem"
          }}>
            <div>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Reading Timer: </span>
              <strong style={{ color: isTimerDone ? "#10b981" : "#ef4444" }}>
                {isTimerDone ? "Completed" : `${secondsRemaining}s remaining`}
              </strong>
            </div>
            <div>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Scroll Progress: </span>
              <strong style={{ color: isScrolledDone ? "#10b981" : "#ef4444" }}>
                {Math.round(scrollProgress)}% {isScrolledDone ? "(Passed)" : "(Scroll to bottom)"}
              </strong>
            </div>
          </div>

        </div>

        {/* Lockdown Action Footer */}
        <div style={{
          padding: "24px 30px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "#ffffff"
        }}>
          {/* Checkbox */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <input
              type="checkbox"
              id="agreeCheck"
              disabled={!canAgree}
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                width: "18px",
                height: "18px",
                cursor: canAgree ? "pointer" : "not-allowed",
                marginTop: "3px"
              }}
            />
            <label
              htmlFor="agreeCheck"
              style={{
                fontSize: "0.88rem",
                color: canAgree ? "#1e293b" : "#94a3b8",
                fontWeight: 700,
                cursor: canAgree ? "pointer" : "not-allowed",
                lineHeight: "1.4"
              }}
            >
              I have read, understood and agree to comply with this policy.
              {!canAgree && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "#ef4444", fontWeight: 600, marginTop: "2px" }}>
                  Please complete the reading requirements (duration, scroll depth, and document review) to check this box.
                </span>
              )}
            </label>
          </div>

          {/* Submission button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleAgreeAndContinue}
              disabled={!agreed || submitting}
              style={{
                background: agreed && !submitting ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "#cbd5e1",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 30px",
                fontSize: "0.95rem",
                fontWeight: 800,
                cursor: agreed && !submitting ? "pointer" : "not-allowed",
                boxShadow: agreed && !submitting ? "0 4px 15px rgba(16, 185, 129, 0.2)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {submitting ? "Submitting..." : (currentIndex + 1 < pendingPolicies.length ? "Agree & Next Policy" : "Agree & Unlock Portal")}
              <LucideCheck size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
