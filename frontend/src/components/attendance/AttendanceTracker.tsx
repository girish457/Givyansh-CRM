import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideAlertCircle, LucideLogOut, LucideX } from "lucide-react";

const AttendanceTracker = forwardRef(({ role, userId, shift }: { role: string, userId?: number, shift?: any }, ref) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showInactivityPopup, setShowInactivityPopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [logoutReason, setLogoutReason] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  
  const lastActivityRef = useRef(Date.now());
  const countdownIntervalRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  const bypassBeforeUnloadRef = useRef(false);

  useImperativeHandle(ref, () => ({
    initiateLogout: () => {
      setShowLogoutPopup(true);
    }
  }));

  const checkAttendanceStatus = async () => {
      if (!userId) return;
      // 800ms delay allows unloading beacons from the previous page load to fully finish processing on the server first
      await new Promise(resolve => setTimeout(resolve, 800));
      try {
          const attRes = await fetch("/api/attendance/punch-in", { method: "POST" });
          const attData = await attRes.json();
          
          if (attData.success) {
              setIsPunchedIn(true);
              if (attData.attendance?.isIdle) {
                  setIsIdle(true);
                  setShowInactivityPopup(true);
                  startCountdown();
              }
          }
      } catch (e) {
          console.error("Auto-punch-in failed", e);
      }
  };

  const syncActivity = async (isBreak: boolean, type: string = 'auto') => {
      try {
          await fetch("/api/attendance/activity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isBreak, type })
          });
      } catch (e) {}
  };

  const startCountdown = () => {
    setCountdown(300);
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setShowInactivityPopup(false);
          confirmLogout("auto logout (inactive)");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleImBack = () => {
    setShowInactivityPopup(false);
    setIsIdle(false);
    lastActivityRef.current = Date.now();
    clearInterval(countdownIntervalRef.current);
    syncActivity(false); // End break
  };

  const confirmLogout = async (overrideReason?: any) => {
    // If called via onClick, overrideReason will be an event object. We only want it if it's a string.
    const actualReason = typeof overrideReason === 'string' ? overrideReason : logoutReason;
    if (!actualReason.trim()) return alert("Reason of Logout is compulsory.");
    
    if (typeof overrideReason === 'string' && overrideReason.startsWith("auto logout")) {
      bypassBeforeUnloadRef.current = true;
    }
    
    try {
      await fetch("/api/attendance/punch-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: actualReason })
      });
      
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Activity Tracking
  useEffect(() => {
    if (role === "boss" || role === "superadmin") return;

    const handleActivity = () => {
      if (showInactivityPopup) return; // Don't reset if popup is showing
      lastActivityRef.current = Date.now();
      if (isIdle) {
        setIsIdle(false);
        syncActivity(false); // Signal back to work
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    if (userId) checkAttendanceStatus();

    const idleCheck = setInterval(() => {
      const now = Date.now();
      const diff = (now - lastActivityRef.current) / 1000;

      if (diff >= 600 && !showInactivityPopup && !isIdle) { // 10 minutes
        // Check if lunch time (approximate client-side check, server will validate)
        const nowTime = new Date();
        const currentMins = nowTime.getHours() * 60 + nowTime.getMinutes();
        // Default lunch 1:30 - 2:00 if shift not loaded
        const isLunch = currentMins >= 810 && currentMins <= 840; 

        if (!isLunch) {
            setIsIdle(true);
            setShowInactivityPopup(true);
            startCountdown();
            syncActivity(true); // Signal break started
        }
      }
    }, 10000);

    heartbeatIntervalRef.current = setInterval(() => {
        if (isPunchedIn && !isIdle) {
            syncActivity(false);
        }
    }, 30000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearInterval(idleCheck);
      clearInterval(heartbeatIntervalRef.current);
    };
  }, [role, showInactivityPopup, isIdle, isPunchedIn, userId]);

  // Clean up countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // 2. Intercept Tab Close
  useEffect(() => {
    if (role === "boss" || role === "superadmin") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (userId && !bypassBeforeUnloadRef.current) {
            e.preventDefault();
            e.returnValue = "Changes you made may not be saved.";
            return e.returnValue;
        }
    };

    const handleKeyShortcut = (e: KeyboardEvent) => {
        if (e.key === "F5" || (e.ctrlKey && e.key === "r") || (e.ctrlKey && e.shiftKey && e.key === "R")) {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            setTimeout(() => window.addEventListener("beforeunload", handleBeforeUnload), 1000);
        }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyShortcut, true);

    const handlePageHide = () => {
        if (userId) {
            const data = JSON.stringify({ reason: "direct logout (tab/browser closed)" });
            const blob = new Blob([data], { type: 'application/json' });
            navigator.sendBeacon("/api/attendance/punch-out", blob);
        }
    };

    window.addEventListener("pagehide", handlePageHide);
    checkAttendanceStatus();

    return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("keydown", handleKeyShortcut);
        window.removeEventListener("pagehide", handlePageHide);
    };
  }, [role, userId]);


  // 3. Shift Window Check & Auto Logout
  useEffect(() => {
    if (!["recruiter", "tl", "manager"].includes(role) || !shift) return;

    const checkWindow = () => {
      try {
        if (!shift?.startTime || !shift?.endTime || typeof shift.startTime !== 'string') return;

        const now = new Date();
        const currentTimeStr = now.toTimeString().split(' ')[0]; 
        const [nowH, nowM] = currentTimeStr.split(':').map(Number);
        if (isNaN(nowH) || isNaN(nowM)) return;
        const nowTotalMins = nowH * 60 + nowM;

        const startParts = shift.startTime.split(':');
        if (startParts.length < 2) return;
        const [startH, startM] = startParts.map(Number);

        const endParts = shift.endTime.split(':');
        if (endParts.length < 2) return;
        const [endH, endM] = endParts.map(Number);

        const startTotalMins = startH * 60 + startM;
        const endTotalMins = endH * 60 + endM;

        const earlyLimit = shift.earlyLoginAllowed !== undefined ? parseInt(shift.earlyLoginAllowed) : 60;
        const postLimit = shift.postShiftAllowed !== undefined ? parseInt(shift.postShiftAllowed) : 120;

        const windowStartMins = startTotalMins - earlyLimit;
        const windowEndMins = endTotalMins + postLimit;

        let isWithin = false;
        const normalize = (m: number) => (m % 1440 + 1440) % 1440;
        
        const normStart = normalize(windowStartMins);
        const normEnd = normalize(windowEndMins);
        
        if (normStart < normEnd) {
            isWithin = nowTotalMins >= normStart && nowTotalMins <= normEnd;
        } else {
            isWithin = nowTotalMins >= normStart || nowTotalMins <= normEnd;
        }

        if (!isWithin) {
            console.log("SHIFT WINDOW EXPIRED: Auto-logging out...");
            setLogoutReason("auto logout (shift window finished)");
            confirmLogout("auto logout (shift window finished)");
        }
      } catch (err) {
        console.error("Shift window check error:", err);
      }
    };

    checkWindow(); // Run on mount
    const interval = setInterval(checkWindow, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [role, shift]);

  if (role === "boss" || role === "superadmin") return null;

  return (
    <>
      <AnimatePresence>
        {showInactivityPopup && (
          <div className="attendance-modal-overlay">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="attendance-card inactivity-card"
            >
              <div className="icon-pulse"><LucideAlertCircle size={48} color="#ef4444" /></div>
              <h2>Are you on work?</h2>
              <p>No activity detected for 10 minutes. Your attendance counting is paused.</p>
              
              <div className="countdown-timer">
                No response in <span className="time">{formatTime(countdown)}</span>
              </div>

              <button className="btn-confirm" onClick={handleImBack}>YES, I AM WORKING</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutPopup && (
          <div className="attendance-modal-overlay">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="attendance-card logout-card"
              style={{ maxWidth: "600px", borderRadius: "24px", padding: "30px" }}
            >
              <div className="flex-between mb-large">
                <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 900 }}>Are you sure to leave?</h1>
                <button className="icon-btn" onClick={() => setShowLogoutPopup(false)} style={{ background: "#f1f5f9", borderRadius: "50%", padding: "4px" }}><LucideX size={20} /></button>
              </div>
              
              <div style={{ textAlign: "center", marginBottom: "30px", color: "#64748b", fontSize: "0.95rem" }}>
                Please provide a reason for logging out. This is mandatory for attendance records.
              </div>
              
              <div className="form-group mt-large">
                <label style={{ fontSize: "0.9rem", color: "#1e293b", marginBottom: "12px", display: "block", textAlign: "left" }}>Reason Of Logout</label>
                <textarea 
                  placeholder="Type your reason here..." 
                  value={logoutReason}
                  onChange={e => setLogoutReason(e.target.value)}
                  autoFocus
                  style={{ 
                    width: "100%", 
                    height: "120px", 
                    padding: "15px", 
                    borderRadius: "12px", 
                    border: "1px solid #e2e8f0", 
                    outline: "none", 
                    resize: "none",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div className="flex-column gap-small mt-large">
                <button 
                  className="btn-danger w-full" 
                  onClick={confirmLogout}
                  style={{ 
                    padding: "16px", 
                    borderRadius: "12px", 
                    fontSize: "1.1rem", 
                    fontWeight: 800, 
                    background: "#ef4444", 
                    color: "white", 
                    border: "none", 
                    cursor: "pointer",
                    boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.4)"
                  }}
                >
                  Confirm Logout
                </button>
                <button 
                   className="btn-text w-full mt-small" 
                   onClick={() => setShowLogoutPopup(false)}
                   style={{ fontWeight: 700, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: "10px" }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .attendance-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .attendance-card {
          background: #fff;
          padding: 40px;
          border-radius: 32px;
          width: 100%;
          maxWidth: 450px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .attendance-card h2 { font-weight: 900; margin-bottom: 12px; }
        .attendance-card p { color: #64748b; line-height: 1.6; }
        .icon-pulse {
          width: 80px;
          height: 80px;
          background: #fef2f2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          animation: pulse-red 2s infinite;
        }
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .countdown-timer { margin: 24px 0; font-weight: 700; color: #475569; }
        .countdown-timer .time { color: #ef4444; font-family: monospace; font-size: 1.2rem; }
        .btn-confirm {
          background: #1e293b; color: #fff; border: none; padding: 16px 32px;
          border-radius: 16px; font-weight: 800; width: 100%; cursor: pointer; transition: 0.2s;
        }
        .btn-confirm:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .form-group label { display: block; text-align: left; font-weight: 800; font-size: 0.85rem; margin-bottom: 8px; color: #475569; }
        .form-group textarea { width: 100%; height: 100px; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; resize: none; }
        .btn-danger { background: #ef4444; color: #fff; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; }
      `}</style>
    </>
  );
});

export default AttendanceTracker;
