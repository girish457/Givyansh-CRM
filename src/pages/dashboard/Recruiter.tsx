// Force Vite HMR rebuild trigger - Updated at 2026-05-21T14:30:00
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  LucidePhoneCall,
  LucideMail,
  LucidePlus,
  LucideFilter,
  LucideSearch,
  LucideLoader2,
  LucideUsers,
  LucideTrendingUp,
  LucideCalendar,
  LucideBriefcase,
  LucideCheckCircle2,
  LucideClock,
  LucideAward,
  LucideRocket,
  LucideEye,
  LucideMessageSquare,
  LucideDownload, LucidePartyPopper, LucideClock3, LucideRefreshCw, LucideX, LucideBell, LucidePhone, LucidePencil, LucideCheck,
  LucideDatabase, LucideXCircle, LucideListTodo, LucideActivity, LucideArrowRight, LucideBuilding2, LucideClipboardList,
  LucidePaperclip, LucideHistory, LucideGitFork, LucideUser, LucidePercent, LucideMegaphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MyTasks from "@/components/dashboard/MyTasks";
import Clients from "@/components/dashboard/Clients";
import Jobs from "@/components/dashboard/Jobs";
import SourcingHub from "@/components/dashboard/SourcingHub";
import MyAttendance from "@/components/dashboard/MyAttendance";
import MyToDoList from "@/components/dashboard/MyToDoList";
import LeadDataView from "@/components/dashboard/LeadDataView";
import MyVendors from "@/components/dashboard/MyVendors";
import ReportingAI from "@/components/dashboard/ReportingAI";
import MyPerformance from "@/components/dashboard/MyPerformance";
import EarnedGiftsCenter from "@/components/dashboard/EarnedGiftsCenter";
import RecruiterIncentiveTracker from "@/components/dashboard/RecruiterIncentiveTracker";
import CandidateReverts from "../../components/dashboard/CandidateReverts";
import ProfileView from "@/components/dashboard/ProfileView";
import AnnouncementPopupSystem from "@/components/dashboard/AnnouncementPopupSystem";
import FeedbackTab from "@/components/dashboard/FeedbackTab";
import "@/styles/Dashboard.css";


// Helper to format date-time string to DD-MM-YYYY , hh:mm AM/PM
const formatReminderDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return "N/A";
  try {
    const trimmed = dateTimeStr.trim();
    const parts = trimmed.split(/\s+/);
    let datePart = parts[0];
    let timePart = parts[1] || "";

    if (datePart.includes("T")) {
      const tIndex = datePart.indexOf("T");
      const timeInISO = datePart.substring(tIndex + 1);
      if (!timePart && timeInISO && !timeInISO.startsWith("00:00:00")) {
        const matches = timeInISO.match(/^(\d{2}):(\d{2})/);
        if (matches) {
          timePart = `${matches[1]}:${matches[2]}`;
        }
      }
      datePart = datePart.split("T")[0];
    }

    const dateSplit = datePart.split("-");
    if (dateSplit.length !== 3) {
      return trimmed;
    }

    const year = dateSplit[0];
    const month = dateSplit[1];
    const day = dateSplit[2];

    if (!timePart) {
      return `${day}-${month}-${year}`;
    }

    let formattedTime = "";
    const timeSplit = timePart.split(":");
    if (timeSplit.length >= 2) {
      let hour = parseInt(timeSplit[0], 10);
      const min = timeSplit[1].substring(0, 2);
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      hour = hour ? hour : 12;
      const hourStr = String(hour).padStart(2, "0");
      formattedTime = `${hourStr}:${min} ${ampm}`;
    }

    return formattedTime ? `${day}-${month}-${year} , ${formattedTime}` : `${day}-${month}-${year}`;
  } catch (err) {
    console.error("Error formatting date-time:", err);
    return dateTimeStr;
  }
};

// --- CANVAS CONFETTI EFFECT ---
const ConfettiEffect = ({ duration, onComplete }: { duration: number; onComplete?: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = [
      "#f43f5e", // Rose
      "#3b82f6", // Blue
      "#10b981", // Emerald
      "#eab308", // Yellow
      "#a855f7", // Purple
      "#ff7a00", // Orange
      "#00f2fe"  // Cyan
    ];

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      oscillationSpeed: number;
      oscillationVal: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 150;
    const startTime = Date.now();
    let spawning = true;

    const createParticle = (side?: "left" | "right"): Particle => {
      const isLeft = side ? side === "left" : Math.random() < 0.5;
      return {
        x: isLeft ? 0 : width,
        y: height * 0.85,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: isLeft ? Math.random() * 18 + 6 : -Math.random() * 18 - 6,
        speedY: -Math.random() * 22 - 18,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 6 - 3,
        oscillationSpeed: Math.random() * 0.1 + 0.05,
        oscillationVal: Math.random() * 100
      };
    };

    // Burst initial particles
    for (let i = 0; i < maxParticles / 2; i++) {
      particles.push(createParticle("left"));
      particles.push(createParticle("right"));
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        spawning = false;
      }

      ctx.clearRect(0, 0, width, height);

      if (spawning && particles.length < maxParticles) {
        particles.push(createParticle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        p.speedY += 0.45; // gravity
        p.speedX *= 0.98; // drag
        p.speedY *= 0.98; // drag

        p.rotation += p.rotationSpeed;
        p.oscillationVal += p.oscillationSpeed;

        ctx.save();
        ctx.translate(p.x + Math.sin(p.oscillationVal) * 5, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, 2 * Math.PI);
          ctx.fill();
        } else if (i % 3 === 1) {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }

        ctx.restore();

        if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0 || spawning) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration + 1500);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 200000
      }}
    />
  );
};

// --- ADVANCED REMINDER SYSTEM ---
export const ReminderSystem = ({ 
  candidates, 
  onRefresh 
}: { 
  candidates: any[], 
  onRefresh: () => void 
}) => {
  const STORAGE_KEY = "crm_active_reminders_v4";
  const ACTIVE_KEY = "crm_currently_active_id_v4";

  const getStorageKey = (user: any) => user ? `crm_active_reminders_v4_${user.id || user._id}` : STORAGE_KEY;
  const getActiveKey = (user: any) => user ? `crm_currently_active_id_v4_${user.id || user._id}` : ACTIVE_KEY;

  const safeParseJSON = (str: string | null, fallback: any) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("Failed to parse JSON from localStorage", e);
      return fallback;
    }
  };

  // State to hold jobs and currentUser
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // States for reasons and rescheduling
  const [reasonModal, setReasonModal] = useState<{
    type: 'NOT_INTERESTED' | 'INTERVIEW_NOT_DONE' | 'REJECTED' | 'NO_DROPPED';
    title: string;
    label: string;
    placeholder: string;
    value: string;
    onConfirm: (reason: string) => void;
  } | null>(null);

  const [notDoneReason, setNotDoneReason] = useState("");
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [selectedRounds, setSelectedRounds] = useState<number[]>([]);

  // Fetch jobs and me on mount
  useEffect(() => {
    fetch("/api/jobs")
      .then(res => res.json())
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching jobs in ReminderSystem:", err));

    fetch("/api/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setCurrentUser(data); })
      .catch(err => console.error("Error fetching me in ReminderSystem:", err));
  }, []);

  // Hydration state for active candidate (loaded once currentUser is available)
  const [active, setActive] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      const storeKey = getStorageKey(currentUser);
      const activeKey = getActiveKey(currentUser);
      const savedId = localStorage.getItem(activeKey);
      const saved = safeParseJSON(localStorage.getItem(storeKey), []);
      if (savedId) {
        const found = saved.find((r: any) => String(r.id) === String(savedId));
        setActive(found || null);
      } else {
        setActive(null);
      }
    } else {
      setActive(null);
    }
  }, [currentUser]);

  const [isProcessing, setIsProcessing] = useState(false);
  const recentlyHandled = useRef<Record<string, number>>({});

  const [confettiDuration, setConfettiDuration] = useState<number | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const triggerConfetti = (dur: number) => {
    setConfettiDuration(dur);
    setConfettiKey(prev => prev + 1);
  };

  const lastActiveTypeRef = useRef<string | null>(null);
  const lastActiveIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (active) {
      if (active.type === 'SELECTED_CELEBRATION' && (lastActiveTypeRef.current !== 'SELECTED_CELEBRATION' || lastActiveIdRef.current !== active.id)) {
        if (confettiDuration !== 4500) {
          triggerConfetti(2500); // 2-3 seconds celebration
        }
      }
      lastActiveTypeRef.current = active.type;
      lastActiveIdRef.current = active.id;
    } else {
      lastActiveTypeRef.current = null;
      lastActiveIdRef.current = null;
    }
  }, [active]);

  // Auto-Hydration: If an active reminder is missing details, fill them from candidates
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "boss" || currentUser.role === "manager") return;
    const storeKey = getStorageKey(currentUser);
    if (active && (!active.designation || active.designation === "N/A")) {
      const fullCandidate = candidates.find(c => String(c.id || c._id) === String(active.id));
      if (fullCandidate) {
        const hydrated = {
          ...active,
          designation: fullCandidate.jobRole || fullCandidate.designation || "N/A",
          remarkReason: fullCandidate.remarkReason || "N/A",
          location: fullCandidate.city && fullCandidate.state ? `${fullCandidate.city}, ${fullCandidate.state}` : (fullCandidate.city || fullCandidate.state || "N/A"),
          scheduledFor: `${fullCandidate.interviewDate} ${fullCandidate.interviewTime || ""}`,
          clientName: fullCandidate.clientName || "N/A",
          remarks: fullCandidate.remarks || "New"
        };
        setActive(hydrated);
        
        // Also update storage so it persists
        const saved = safeParseJSON(localStorage.getItem(storeKey), []);
        const updated = saved.map((r: any) => String(r.id) === String(active.id) ? hydrated : r);
        localStorage.setItem(storeKey, JSON.stringify(updated));
      }
    }
  }, [active, candidates, currentUser]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!currentUser) return;
      if (String(currentUser.role).toLowerCase() === "boss" || String(currentUser.role).toLowerCase() === "manager") return;
      const storeKey = getStorageKey(currentUser);
      const activeKey = getActiveKey(currentUser);
      const now = Date.now();
      let savedReminders = safeParseJSON(localStorage.getItem(storeKey), []);
      let updated = false;

      // 1. Check candidates for new triggers
      candidates.forEach(c => {
        const cid = c.id || c._id;
        
        // Filter: strictly only allow candidate popups if the candidate was added by or is assigned to the current user
        const curId = String(currentUser.id || currentUser._id || "").trim();
        const cAddedBy = String(typeof c.addedBy === "object" && c.addedBy ? (c.addedBy.id || c.addedBy._id) : (c.addedBy || "")).trim();
        const cAssignedTo = String(typeof c.assignedTo === "object" && c.assignedTo ? (c.assignedTo.id || c.assignedTo._id) : (c.assignedTo || "")).trim();
        
        if (cAddedBy !== curId && cAssignedTo !== curId) {
          return;
        }

        // SKIP if handled recently
        if (recentlyHandled.current[cid] && now - recentlyHandled.current[cid] < 15000) return;

        // TERMINAL STATUS CHECK
        const terminalStatuses = ["not interested", "rejected", "joined", "dropped"];
        if (c.remarks && terminalStatuses.includes(c.remarks.toLowerCase())) return;

        let dateToUse = c.interviewDate || c.followUpDate;
        if (c.interviewDate && c.followUpDate) {
          const iD = new Date(c.interviewDate).getTime();
          const fD = new Date(c.followUpDate).getTime();
          if (fD > iD) {
            dateToUse = c.followUpDate;
          }
        }

        if (dateToUse) {
          const iDate = new Date(dateToUse);
          const iTime = c.interviewTime || "00:00";
          
          if (c.interviewTime || c.interviewDate) {
            const [h, m] = iTime.split(':');
            iDate.setHours(parseInt(h), parseInt(m), 0, 0);
          } else {
            if (typeof dateToUse === 'string' && (dateToUse.includes('T') || dateToUse.includes(' '))) {
              // keep existing time
            } else {
              iDate.setHours(0, 0, 0, 0);
            }
          }
          const triggerAt = iDate.getTime();

          const remarksLower = (c.remarks || "").toLowerCase();
          let type = "";

          if (!remarksLower || 
              remarksLower === "new" || 
              remarksLower === "interested" || 
              remarksLower === "connected" || 
              remarksLower === "interview scheduled" || 
              remarksLower === "interview rescheduled") {
            type = 'INITIAL_REMINDER';
          } else if (remarksLower === "go for interview") {
            type = 'INTERVIEW_COMPLETION_CHECK';
          } else if (remarksLower === "all rounds done") {
            type = 'STATUS_CHECK';
          } else if (remarksLower.includes("round") || remarksLower === "processing for next round") {
            type = 'NEXT_DAY_FOLLOWUP';
          } else if (remarksLower === "selected") {
            type = 'SELECTED_CELEBRATION';
          } else if (remarksLower === "process to joining" || remarksLower === "processing for joining") {
            type = 'JOINING_CHECK';
          }

          if (type) {
            // Adjust trigger time offset for check types
            let finalTriggerAt = triggerAt;
            if (type === 'INTERVIEW_COMPLETION_CHECK') {
              finalTriggerAt = triggerAt + 5 * 60 * 60 * 1000;
            } else if (type === 'NEXT_DAY_FOLLOWUP') {
              if (remarksLower === "processing for next round") {
                finalTriggerAt = triggerAt + 5 * 60 * 60 * 1000;
              } else {
                finalTriggerAt = triggerAt + 24 * 60 * 60 * 1000;
              }
            } else if (type === 'JOINING_CHECK') {
              finalTriggerAt = triggerAt + 24 * 60 * 60 * 1000;
            }

            console.log(`[Reminder Check] Candidate: ${c.name} | Status: ${c.remarks} | Type: ${type} | Trigger: ${new Date(finalTriggerAt).toLocaleString()} | Now: ${new Date(now).toLocaleString()} | Fired? ${now >= finalTriggerAt}`);

            const currentActiveId = localStorage.getItem(activeKey);
            const existingReminder = savedReminders.find((r: any) => String(r.id) === String(cid));
            if (existingReminder) {
              if (existingReminder.triggerAt > now && finalTriggerAt <= now) {
                // Keep the future scheduled/snoozed reminder in localStorage; do not overwrite with past database calculation
                return;
              }
              if (Number(existingReminder.triggerAt) !== Number(finalTriggerAt)) {
                // Time has changed (rescheduled or new follow-up date). Replace reminder.
                savedReminders = savedReminders.filter((r: any) => String(r.id) !== String(cid));
                if (currentActiveId === String(cid)) {
                  localStorage.removeItem(activeKey);
                  setActive(null);
                }
              } else {
                // Already scheduled for this exact time. Skip.
                return;
              }
            }

            if (now >= finalTriggerAt) {
              savedReminders.push({
                id: cid,
                name: c.name,
                phone: c.phone,
                designation: c.jobRole || c.designation || "N/A",
                remarkReason: c.remarkReason || "N/A",
                location: c.city && c.state ? `${c.city}, ${c.state}` : (c.city || c.state || "N/A"),
                scheduledFor: `${dateToUse} ${c.interviewTime || ""}`,
                type: type,
                triggerAt: finalTriggerAt,
                status: 'PENDING',
                clientName: c.clientName || "N/A",
                remarks: c.remarks || "New"
              });
              updated = true;
            }
          }
        }
      });

      // 2. Queue Logic
      const currentActiveId = localStorage.getItem(activeKey);
      if (!currentActiveId) {
        const nextReady = savedReminders.find((r: any) => r.status === 'PENDING' && now >= (r.triggerAt || 0));
        if (nextReady) {
          localStorage.setItem(activeKey, nextReady.id);
          setActive(nextReady);
        }
      }

      if (updated) {
        localStorage.setItem(storeKey, JSON.stringify(savedReminders));
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [candidates, currentUser]);

  useEffect(() => {
    const handleStartTest = () => {
      setActive({
        id: "test_dummy_123",
        type: "INITIAL_REMINDER",
        triggerAt: Date.now(),
        name: "Test Dummy Candidate",
        phone: "9999999999",
        designation: "Software Engineer",
        location: "Mumbai",
        scheduledFor: new Date().toISOString()
      });
      setReasonModal(null);
      setRescheduleMode(false);
    };
    window.addEventListener("START_TEST_POP", handleStartTest);
    return () => window.removeEventListener("START_TEST_POP", handleStartTest);
  }, []);

  const updateReminder = (id: string, updates: any) => {
    if (id === "test_dummy_123") {
      setActive((prev: any) => ({ ...prev, ...updates, triggerAt: Date.now() }));
      return;
    }
    recentlyHandled.current[id] = Date.now();
    const storeKey = getStorageKey(currentUser);
    const activeKey = getActiveKey(currentUser);
    const saved = safeParseJSON(localStorage.getItem(storeKey), []);
    const updated = saved.map((r: any) => String(r.id) === String(id) ? { ...r, ...updates, status: 'PENDING' } : r);
    localStorage.setItem(storeKey, JSON.stringify(updated));
    localStorage.removeItem(activeKey);
    setActive(null);
  };

  const removeReminder = (id: string) => {
    if (id === "test_dummy_123") {
      setActive(null);
      return;
    }
    recentlyHandled.current[id] = Date.now();
    const storeKey = getStorageKey(currentUser);
    const activeKey = getActiveKey(currentUser);
    const saved = safeParseJSON(localStorage.getItem(storeKey), []);
    const filtered = saved.filter((r: any) => String(r.id) !== String(id));
    localStorage.setItem(storeKey, JSON.stringify(filtered));
    localStorage.removeItem(activeKey);
    setActive(null);
  };

  const updateCandidateStatus = async (id: string, remarks: string, interviewDate?: string, remarkReason?: string, interviewTime?: string) => {
    if (id === "test_dummy_123") return;
    try {
      const body: any = { remarks };
      if (interviewDate) body.interviewDate = interviewDate;
      if (interviewTime) body.interviewTime = interviewTime;
      if (remarkReason) body.remarkReason = remarkReason;
      await fetch("/api/candidates/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      onRefresh();
      window.dispatchEvent(new Event("REFRESH_GAMIFICATION"));
    } catch (e) { console.error(e); }
  };

  const logAction = async (msg: string) => {
    if (active?.id === "test_dummy_123") return;
    try {
      await fetch(`/api/candidates/${active.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg })
      });
    } catch (e) { console.error(e); }
  };

  // Helper to parse job config of active candidate
  const getCandidateJobInfo = () => {
    if (!active) return { rounds: 1, names: ["Round 1"] };
    if (active.id === "test_dummy_123") {
      return { rounds: 5, names: ["Round 1", "Round 2", "Round 3", "Round 4", "Round 5"] };
    }
    const jobTitle = active.designation || active.jobRole || "";
    const foundJob = jobs.find((j: any) => j.title?.toLowerCase() === jobTitle.toLowerCase());
    if (!foundJob) return { rounds: 1, names: ["Round 1"] };
    
    const roundsCount = foundJob.interviewRounds || 1;
    const names = [];
    for (let i = 1; i <= roundsCount; i++) {
      names.push(foundJob[`round${i}Name`] || `Round ${i}`);
    }
    return { rounds: roundsCount, names };
  };

  const getCompletedRoundsCount = (candidateRemarks: string) => {
    const r = (candidateRemarks || "").toLowerCase();
    if (r.includes("all rounds done")) return 5;
    const matches = r.match(/round (\d+) done/);
    if (matches) return parseInt(matches[1]);
    return 0;
  };

  // Pre-initialize selected rounds checkboxes when round tracking opens
  useEffect(() => {
    if (active && (active.type === 'ROUND_TRACKING' || active.type === 'NEXT_DAY_FOLLOWUP')) {
      const { rounds: totalRounds } = getCandidateJobInfo();
      const count = getCompletedRoundsCount(active.remarks || "");
      const initial: number[] = [];
      for (let i = 1; i <= count && i <= totalRounds; i++) {
        initial.push(i);
      }
      setSelectedRounds(initial);
    }
  }, [active?.id, active?.type, active?.remarks]);

  // Handler for Not Interested
  const triggerNotInterestedReason = () => {
    setReasonModal({
      type: 'NOT_INTERESTED',
      title: "Reason For Not Interested",
      label: `Please provide a reason why ${active.name} is not interested.`,
      placeholder: "Type reason here...",
      value: "",
      onConfirm: async (reason) => {
        const oldStatus = active.remarks || "New";
        const date = new Date().toLocaleDateString('en-GB');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const user = currentUser?.name || "Recruiter";
        
        await updateCandidateStatus(active.id, "Not Interested", undefined, reason);
        await logAction(`Status changed from "${oldStatus}" to "Not Interested" by ${user} (Recruiter) at ${date} ${time}. Remarks: ${reason}`);
        removeReminder(active.id);
        setReasonModal(null);
      }
    });
  };

  // Handler for Go For Interview
  const handleGoForInterview = async () => {
    const oldStatus = active.remarks || "New";
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const user = currentUser?.name || "Recruiter";
    
    await updateCandidateStatus(active.id, "Go For Interview");
    await logAction(`Status changed from "${oldStatus}" to "Go For Interview" by ${user} (Recruiter) at ${date} ${time}. Remarks: Go For Interview`);
    
    // Snooze for 5 hours and open INTERVIEW_COMPLETION_CHECK
    updateReminder(active.id, { type: 'INTERVIEW_COMPLETION_CHECK', triggerAt: Date.now() + 5 * 60 * 60 * 1000 });
  };

  // Handler for Interview Not Done Reason
  const triggerInterviewNotDoneReason = () => {
    setReasonModal({
      type: 'INTERVIEW_NOT_DONE',
      title: "Interview Not Done Reason",
      label: `Please provide a reason why the interview was not done for ${active.name}.`,
      placeholder: "Type reason here...",
      value: "",
      onConfirm: (reason) => {
        setNotDoneReason(reason);
        setReasonModal(null);
        setRescheduleMode(true);
      }
    });
  };

  // Handler for Reschedule
  const handleRescheduleSubmit = async () => {
    const oldStatus = active.remarks || "New";
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const user = currentUser?.name || "Recruiter";
    
    await updateCandidateStatus(active.id, "Interview Rescheduled", rescheduleDate, notDoneReason, rescheduleTime);
    await logAction(`Status changed from "${oldStatus}" to "Interview Rescheduled" by ${user} (Recruiter) at ${date} ${time}. Remarks: Rescheduled for ${rescheduleDate} ${rescheduleTime}. Reason: ${notDoneReason}`);
    
    // Create new reminder in localStorage at target rescheduled time
    const targetTime = rescheduleDate ? new Date(`${rescheduleDate}T${rescheduleTime || '00:00'}`).getTime() : Date.now() + 24 * 60 * 60 * 1000;
    const storeKey = getStorageKey(currentUser);
    const activeKey = getActiveKey(currentUser);
    const saved = safeParseJSON(localStorage.getItem(storeKey), []);
    const filtered = saved.filter((r: any) => String(r.id) !== String(active.id));
    filtered.push({
      id: active.id,
      name: active.name,
      phone: active.phone,
      designation: active.designation,
      remarkReason: notDoneReason,
      location: active.location,
      scheduledFor: `${rescheduleDate} ${rescheduleTime}`,
      type: 'INITIAL_REMINDER',
      triggerAt: targetTime,
      status: 'PENDING',
      clientName: active.clientName || "N/A",
      remarks: "Interview Rescheduled"
    });
    
    localStorage.setItem(storeKey, JSON.stringify(filtered));
    localStorage.removeItem(activeKey);
    setActive(null);
    setRescheduleMode(false);
    setNotDoneReason("");
    setRescheduleDate("");
    setRescheduleTime("");
    onRefresh();
  };

  // Handler for Cancel Rescheduling (Sets status to Interview Not Done and ends workflow)
  const handleCancelReschedule = async () => {
    const oldStatus = active.remarks || "New";
    const date = new Date().toLocaleDateString('en-GB');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const user = currentUser?.name || "Recruiter";
    
    await updateCandidateStatus(active.id, "Interview Not Done", undefined, notDoneReason);
    await logAction(`Status changed from "${oldStatus}" to "Interview Not Done" by ${user} (Recruiter) at ${date} ${time}. Remarks: Interview Cancelled. Reason: ${notDoneReason}`);
    
    removeReminder(active.id);
    setRescheduleMode(false);
    setNotDoneReason("");
  };

  // Handler for Rounds Checkbox Submit
  const handleRoundsSubmit = async () => {
    const { rounds: totalRounds, names: roundNames } = getCandidateJobInfo();
    const sorted = [...selectedRounds].sort((a, b) => a - b);
    const highestRound = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
    
    const isAllDone = sorted.length === totalRounds || highestRound === totalRounds;
    const oldStatus = active.remarks || "Go For Interview";
    const dateStr = new Date().toLocaleDateString('en-GB');
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const userName = currentUser?.name || "Recruiter";

    if (isAllDone) {
      await updateCandidateStatus(active.id, "All Rounds Done");
      await logAction(`Status changed from "${oldStatus}" to "All Rounds Done" by ${userName} (Recruiter) at ${dateStr} ${timeStr}. Remarks: All interview rounds completed successfully.`);
      updateReminder(active.id, { type: 'STATUS_CHECK', remarks: "All Rounds Done" });
    } else {
      const newStatus = `Round ${highestRound} Done`;
      await updateCandidateStatus(active.id, newStatus);
      
      const completedNames = sorted.map(idx => roundNames[idx - 1]).join(", ");
      const pendingNames = roundNames.filter((_, i) => !sorted.includes(i + 1)).join(", ");
      await logAction(`Status changed from "${oldStatus}" to "${newStatus}" by ${userName} (Recruiter) at ${dateStr} ${timeStr}. Remarks: Completed: [${completedNames}]. Pending: [${pendingNames}].`);
      
      // Schedule follow-up popup next day (24 hours)
      updateReminder(active.id, { type: 'NEXT_DAY_FOLLOWUP', remarks: newStatus, triggerAt: Date.now() + 24 * 60 * 60 * 1000 });
    }
  };

  // Handler for Processing For Next Round
  const handleProcessingForNextRound = async () => {
    const oldStatus = active.remarks || "Go For Interview";
    const dateStr = new Date().toLocaleDateString('en-GB');
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const userName = currentUser?.name || "Recruiter";
    
    const newRemarks = (active.remarks && active.remarks.toLowerCase().includes("round")) ? active.remarks : "Processing For Next Round";
    
    await updateCandidateStatus(active.id, newRemarks);
    await logAction(`Status changed from "${oldStatus}" to "Processing For Next Round" by ${userName} (Recruiter) at ${dateStr} ${timeStr}. Remarks: Processing for the next round.`);
    
    // Reshow same popup after 5 hours
    updateReminder(active.id, { type: 'NEXT_DAY_FOLLOWUP', remarks: newRemarks, triggerAt: Date.now() + 5 * 60 * 60 * 1000 });
  };

  // Handler for simple outcomes: Selected, Joined, Process To Joining
  const handleOutcomeAction = async (newStatus: string) => {
    const oldStatus = active.remarks || "New";
    if (newStatus === "Joined") {
      triggerConfetti(4500);
    }
    await updateCandidateStatus(active.id, newStatus);
    const dateStr = new Date().toLocaleDateString('en-GB');
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const userName = currentUser?.name || "Recruiter";
    await logAction(`Status changed from "${oldStatus}" to "${newStatus}" by ${userName} (Recruiter) at ${dateStr} ${timeStr}. Remarks: Candidate updated to ${newStatus}.`);

    if (newStatus === "Selected") {
      updateReminder(active.id, { type: 'SELECTED_CELEBRATION' });
    } else if (newStatus === "Process To Joining" || newStatus === "Processing for Joining") {
      updateReminder(active.id, { type: 'JOINING_CHECK', triggerAt: Date.now() + 24 * 60 * 60 * 1000 });
    } else if (newStatus === "Joined") {
      removeReminder(active.id);
    }
  };

  // Handler for Rejection
  const triggerRejectionReason = () => {
    setReasonModal({
      type: 'REJECTED',
      title: "Rejection Reason",
      label: `Please provide a reason why ${active.name} was rejected.`,
      placeholder: "Type rejection reason here...",
      value: "",
      onConfirm: async (reason) => {
        const oldStatus = active.remarks || "New";
        const dateStr = new Date().toLocaleDateString('en-GB');
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const userName = currentUser?.name || "Recruiter";
        
        await updateCandidateStatus(active.id, "Rejected", undefined, reason);
        await logAction(`Status changed from "${oldStatus}" to "Rejected" by ${userName} (Recruiter) at ${dateStr} ${timeStr}. Remarks: ${reason}`);
        removeReminder(active.id);
        setReasonModal(null);
      }
    });
  };

  // Handler for Drop (Final Onboarding Check -> Dropped)
  const triggerDroppedReason = () => {
    setReasonModal({
      type: 'NO_DROPPED',
      title: "Reason of Drop",
      label: `Please provide a reason why ${active.name} dropped.`,
      placeholder: "Type drop reason here...",
      value: "",
      onConfirm: async (reason) => {
        const oldStatus = active.remarks || "New";
        const dateStr = new Date().toLocaleDateString('en-GB');
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const userName = currentUser?.name || "Recruiter";
        
        await updateCandidateStatus(active.id, "Dropped", undefined, reason);
        await logAction(`Status changed from "${oldStatus}" to "Dropped" by ${userName} (Recruiter) at ${dateStr} ${timeStr}. Remarks: Final Onboarding Check: Dropped. Reason: ${reason}`);
        removeReminder(active.id);
        setReasonModal(null);
      }
    });
  };

  // Render Buttons based on Type
  const renderButtons = () => {
    if (!active) return null;

    if (rescheduleMode) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <div style={{ fontWeight: 800, fontSize: "0.82rem", color: "#475569" }}>Select Reschedule Date:</div>
          
          <button 
            type="button"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setRescheduleDate(tomorrow.toISOString().split('T')[0]);
            }} 
            className="btn-reminder" 
            style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "10px" }}
          >
            Tomorrow
          </button>
          
          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
               <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>DATE</span>
               <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
               <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>TIME</span>
               <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.8rem", boxSizing: "border-box" }} />
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
             <button 
                type="button"
                onClick={handleCancelReschedule} 
                className="btn-reminder" 
                style={{ background: "#fee2e2", color: "#dc2626", flex: 1 }}
             >
               Cancel Workflow
             </button>
             <button 
                type="button"
                onClick={handleRescheduleSubmit} 
                disabled={!rescheduleDate}
                className="btn-reminder" 
                style={{ background: "#2563eb", color: "#fff", flex: 1, opacity: rescheduleDate ? 1 : 0.6 }}
             >
               Submit
             </button>
          </div>
        </div>
      );
    }

    switch (active.type) {
      case 'INITIAL_REMINDER':
        return (
          <>
            <button type="button" onClick={() => updateReminder(active.id, { triggerAt: Date.now() + 10 * 60 * 1000 })} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Call Not Pick</button>
            <button type="button" onClick={handleGoForInterview} className="btn-reminder" style={{ background: "#2563eb", color: "#fff" }}>Go For Interview</button>
            <button type="button" onClick={triggerNotInterestedReason} className="btn-reminder" style={{ background: "#fee2e2", color: "#dc2626" }}>Not Interested</button>
            <button type="button" onClick={() => setRescheduleMode(true)} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Schedule Later</button>
          </>
        );

      case 'INTERVIEW_COMPLETION_CHECK':
        return (
          <>
            <button 
              type="button" 
              onClick={() => {
                const { rounds: totalRounds } = getCandidateJobInfo();
                if (totalRounds === 1) {
                  updateReminder(active.id, { type: 'STATUS_CHECK' });
                } else {
                  updateReminder(active.id, { type: 'ROUND_TRACKING' });
                }
              }} 
              className="btn-reminder" 
              style={{ background: "#22c55e", color: "#fff" }}
            >
              Interview Done
            </button>
            <button 
              type="button" 
              onClick={triggerInterviewNotDoneReason} 
              className="btn-reminder" 
              style={{ background: "#dc2626", color: "#fff" }}
            >
              Interview Not Done
            </button>
            <button type="button" onClick={triggerNotInterestedReason} className="btn-reminder" style={{ background: "#fee2e2", color: "#dc2626", gridColumn: "span 2" }}>Not Interested</button>
          </>
        );

      case 'ROUND_TRACKING':
      case 'NEXT_DAY_FOLLOWUP': {
        const { rounds: totalRounds, names: roundNames } = getCandidateJobInfo();
        const completedCount = getCompletedRoundsCount(active.remarks || "");
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Select Completed Rounds:</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#f8fafc", padding: "10px", borderRadius: "12px" }}>
              {roundNames.map((name, idx) => {
                const roundNum = idx + 1;
                if (roundNum <= completedCount) return null;
                const isChecked = selectedRounds.includes(roundNum);
                return (
                  <label key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", background: isChecked ? "#eff6ff" : "transparent", borderRadius: "8px", border: isChecked ? "1px solid #bfdbfe" : "1px solid transparent", cursor: "pointer", transition: "0.2s" }}>
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedRounds(selectedRounds.filter(r => r !== roundNum));
                        } else {
                          setSelectedRounds([...selectedRounds, roundNum]);
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.82rem", fontWeight: isChecked ? 700 : 500, color: isChecked ? "#1e40af" : "#334155" }}>
                      Round {roundNum}: {name}
                    </span>
                  </label>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
              <button 
                type="button"
                onClick={handleProcessingForNextRound}
                className="btn-reminder" 
                style={{ background: "#f1f5f9", color: "#475569" }}
              >
                Processing For Next Round
              </button>
              <button 
                type="button"
                onClick={async () => {
                  const oldStatus = active.remarks || "Go For Interview";
                  const dateStr = new Date().toLocaleDateString('en-GB');
                  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  const userName = currentUser?.name || "Recruiter";
                  
                  await updateCandidateStatus(active.id, "All Rounds Done");
                  await logAction(`Status changed from "${oldStatus}" to "All Rounds Done" by ${userName} (Recruiter) at ${dateStr} ${timeStr}. Remarks: All interview rounds completed successfully.`);
                  updateReminder(active.id, { type: 'STATUS_CHECK', remarks: "All Rounds Done" });
                }}
                className="btn-reminder" 
                style={{ background: "#0f172a", color: "#fff" }}
              >
                All Rounds Done
              </button>
              <button 
                type="button"
                disabled={selectedRounds.length === 0}
                onClick={handleRoundsSubmit}
                className="btn-reminder" 
                style={{ background: "#2563eb", color: "#fff", opacity: selectedRounds.length > 0 ? 1 : 0.6 }}
              >
                Submit Round Selection
              </button>
              <button 
                type="button" 
                onClick={triggerNotInterestedReason} 
                className="btn-reminder" 
                style={{ background: "#fee2e2", color: "#dc2626", gridColumn: "span 2" }}
              >
                Not Interested
              </button>
            </div>
          </div>
        );
      }

      case 'STATUS_CHECK':
        return (
          <>
            <button type="button" onClick={() => handleOutcomeAction("Selected")} className="btn-reminder" style={{ background: "#22c55e", color: "#fff" }}>Selected</button>
            <button type="button" onClick={triggerRejectionReason} className="btn-reminder" style={{ background: "#dc2626", color: "#fff" }}>Rejected</button>
            <button type="button" onClick={() => handleOutcomeAction("Joined")} className="btn-reminder" style={{ background: "#2563eb", color: "#fff" }}>Joined</button>
            <button type="button" onClick={() => handleOutcomeAction("Process To Joining")} className="btn-reminder" style={{ background: "#0f172a", color: "#fff" }}>Process To Joining</button>
            <button type="button" onClick={triggerNotInterestedReason} className="btn-reminder" style={{ background: "#fee2e2", color: "#dc2626", gridColumn: "span 2" }}>Not Interested</button>
          </>
        );

      case 'SELECTED_CELEBRATION':
        return (
          <>
            <button type="button" onClick={() => handleOutcomeAction("Process To Joining")} className="btn-reminder" style={{ background: "#2563eb", color: "#fff", gridColumn: "span 2" }}>Process To Joining</button>
            <button type="button" onClick={() => handleOutcomeAction("Joined")} className="btn-reminder" style={{ background: "#22c55e", color: "#fff" }}>Joined</button>
            <button type="button" onClick={() => updateReminder(active.id, { triggerAt: Date.now() + 24 * 60 * 60 * 1000 })} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Revert Later</button>
            <button type="button" onClick={triggerNotInterestedReason} className="btn-reminder" style={{ background: "#fee2e2", color: "#dc2626", gridColumn: "span 2" }}>Not Interested</button>
          </>
        );

      case 'JOINING_CHECK':
        return (
          <>
            <button type="button" onClick={() => handleOutcomeAction("Joined")} className="btn-reminder" style={{ background: "#22c55e", color: "#fff" }}>Yes (Joined)</button>
            <button type="button" onClick={triggerDroppedReason} className="btn-reminder" style={{ background: "#dc2626", color: "#fff" }}>No (Dropped)</button>
            <button type="button" onClick={() => handleOutcomeAction("Processing for Joining")} className="btn-reminder" style={{ background: "#2563eb", color: "#fff" }}>Processing for Joining</button>
            <button type="button" onClick={() => updateReminder(active.id, { triggerAt: Date.now() + 5 * 60 * 60 * 1000 })} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Revert Later</button>
          </>
        );

      default:
        return (
          <>
            <button type="button" onClick={() => updateReminder(active.id, { triggerAt: Date.now() + 10 * 60 * 1000 })} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Call Not Pick</button>
            <button type="button" onClick={handleGoForInterview} className="btn-reminder" style={{ background: "#2563eb", color: "#fff" }}>Go For Interview</button>
            <button type="button" onClick={triggerNotInterestedReason} className="btn-reminder" style={{ background: "#fee2e2", color: "#dc2626" }}>Not Interested</button>
            <button type="button" onClick={() => setRescheduleMode(true)} className="btn-reminder" style={{ background: "#f1f5f9", color: "#475569" }}>Schedule Later</button>
          </>
        );
    }
  };

  // Render Rounds Progress header if ROUND_TRACKING or NEXT_DAY_FOLLOWUP
  const renderRoundsProgress = () => {
    const { rounds: totalRounds, names: roundNames } = getCandidateJobInfo();
    const count = getCompletedRoundsCount(active?.remarks || "");
    const completedList = roundNames.slice(0, count);
    const pendingList = roundNames.slice(count);
    
    return (
      <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "18px", fontSize: "0.82rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontWeight: 800, color: "#475569" }}>
          <span>Round Progress</span>
          <span style={{ color: "#2563eb" }}>{count} / {totalRounds} Done</span>
        </div>
        
        {/* Progress Bar */}
        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", marginBottom: "14px" }}>
          <div style={{ height: "100%", width: `${(count / totalRounds) * 100}%`, background: "#2563eb", transition: "width 0.4s ease" }}></div>
        </div>
        
        {/* Completed list */}
        <div style={{ marginBottom: "6px" }}>
          <strong style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Completed: </strong>
          {completedList.length === 0 ? (
            <span style={{ color: "#94a3b8" }}>None</span>
          ) : (
            completedList.map((name, idx) => (
              <span key={idx} style={{ background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 600, marginRight: "4px", display: "inline-block" }}>✓ {name}</span>
            ))
          )}
        </div>
        
        {/* Pending list */}
        <div>
          <strong style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Pending: </strong>
          {pendingList.length === 0 ? (
            <span style={{ color: "#22c55e", fontWeight: 700 }}>All Done! 🎉</span>
          ) : (
            pendingList.map((name, idx) => (
              <span key={idx} style={{ background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 500, marginRight: "4px", display: "inline-block" }}>{name}</span>
            ))
          )}
        </div>
      </div>
    );
  };

  if (!currentUser || currentUser.role === "boss" || currentUser.role === "manager") {
    return null;
  }

  return (
    <>
      {confettiDuration !== null && (
        <ConfettiEffect
          key={confettiKey}
          duration={confettiDuration}
          onComplete={() => setConfettiDuration(null)}
        />
      )}

      {active && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            style={{ 
              background: "#ffffff", 
              borderRadius: "24px", 
              width: "100%", 
              maxWidth: "420px", 
              maxHeight: "90vh",
              overflowY: "auto", 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              position: "relative"
            }}
          >
            <div style={{ 
              background: active.type === 'SELECTED_CELEBRATION' ? "linear-gradient(135deg, #10b981 0%, #047857 100%)" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
              padding: "20px 24px", 
              color: "#fff",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Subtle Background Pattern */}
              <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "90px", height: "90px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
              <div style={{ position: "absolute", bottom: "-20px", left: "-20px", width: "60px", height: "60px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active.type === 'SELECTED_CELEBRATION' ? <LucidePartyPopper size={18} /> : <LucideBell size={18} />}
                </div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
                  {active.type === 'STATUS_CHECK' ? "Interview Outcome" :
                   active.type === 'SELECTED_CELEBRATION' ? "Hiring Celebration!" :
                   active.type === 'JOINING_CHECK' ? "Final Onboarding Check" :
                   active.type === 'INTERVIEW_COMPLETION_CHECK' ? "Interview Completion Check" :
                   active.type === 'ROUND_TRACKING' ? "Interview Round Tracking" :
                   active.type === 'NEXT_DAY_FOLLOWUP' ? "Next Day Round Follow-Up" :
                   "Interview Reminder"}
                </h2>
              </div>
              <p style={{ opacity: 0.9, fontSize: "0.85rem", marginTop: "8px", marginBottom: 0, fontWeight: 500, lineHeight: 1.4 }}>
                {active.type === 'SELECTED_CELEBRATION' ? `${active.name} is selected! Great job. What's next?` :
                 active.type === 'STATUS_CHECK' ? `What is the interview outcome for ${active.name}?` :
                 active.type === 'JOINING_CHECK' ? `Is ${active.name} successfully joined today?` :
                 active.type === 'INTERVIEW_COMPLETION_CHECK' ? `Has ${active.name} completed the interview?` :
                 active.type === 'ROUND_TRACKING' ? `Track interview rounds for ${active.name}` :
                 active.type === 'NEXT_DAY_FOLLOWUP' ? `Follow-up round progress for ${active.name}` :
                 "Candidate's interview is scheduled now. Please connect."}
              </p>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                marginBottom: "16px", 
                background: "#f8fafc", 
                padding: "12px 14px", 
                borderRadius: "16px", 
                border: "1px solid #f1f5f9",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.01)"
              }}>
                <div style={{ 
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "50%", 
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                  color: "#fff", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "1.1rem", 
                  fontWeight: 800, 
                  boxShadow: "0 4px 10px -2px rgba(59, 130, 246, 0.3)" 
                }}>{active.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                     <div style={{ color: "#3b82f6", fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                       <LucideBriefcase size={10} /> {active.designation || "Job Title N/A"}
                     </div>
                     <div style={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                       <LucidePhoneCall size={10} /> {active.phone}
                     </div>
                  </div>
                </div>
                <a href={"tel:" + active.phone} className="call-btn-pulse" style={{ background: "#10b981", color: "#fff", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px -2px rgba(16, 185, 129, 0.3)", transition: "0.3s" }}><LucidePhone size={16} /></a>
              </div>

              {/* Conditionally Render Round Progress Info */}
              {(active.type === 'ROUND_TRACKING' || active.type === 'NEXT_DAY_FOLLOWUP') && renderRoundsProgress()}

              {/* Secondary Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                 <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em" }}>Location</span>
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e293b", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.location || "N/A"}</span>
                 </div>
                 <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em" }}>Scheduled For</span>
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#10b981", display: "block" }}>{formatReminderDateTime(active.scheduledFor)}</span>
                 </div>
                 
                 {active.type === 'INTERVIEW_COMPLETION_CHECK' && (
                   <>
                     <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em" }}>Client</span>
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e293b", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.clientName || "N/A"}</span>
                     </div>
                     <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em" }}>Current Status</span>
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#2563eb", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.remarks || "Go For Interview"}</span>
                     </div>
                   </>
                 )}

                 <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "12px", border: "1px solid #f1f5f9", gridColumn: "span 2" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em" }}>Last Remark Reason</span>
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e293b", display: "block" }}>{active.remarkReason || "N/A"}</span>
                 </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: active.type === 'ROUND_TRACKING' || active.type === 'NEXT_DAY_FOLLOWUP' || rescheduleMode ? "1fr" : "1fr 1fr", gap: "10px" }}>
                {renderButtons()}
              </div>
              
              {isProcessing && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, borderRadius: "24px" }}>
                   <LucideLoader2 className="animate-spin" size={30} color="#3b82f6" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Mandatory Reason Dialog Overlay */}
      {reasonModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(8px)", zIndex: 110000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            style={{ 
              background: "#ffffff", 
              borderRadius: "24px", 
              width: "100%", 
              maxWidth: "400px", 
              overflow: "hidden", 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              padding: "24px"
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: "0 0 10px 0" }}>{reasonModal.title}</h3>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 16px 0" }}>{reasonModal.label}</p>
            
            <textarea 
              autoFocus
              value={reasonModal.value}
              onChange={e => setReasonModal({ ...reasonModal, value: e.target.value })}
              placeholder={reasonModal.placeholder}
              style={{ width: "100%", minHeight: "120px", padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: "14px", fontSize: "0.9rem", outline: "none", resize: "none", marginBottom: "16px", boxSizing: "border-box" }}
            />
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                type="button"
                onClick={() => setReasonModal(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={!reasonModal.value.trim()}
                onClick={() => reasonModal.onConfirm(reasonModal.value.trim())}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", opacity: reasonModal.value.trim() ? 1 : 0.6 }}
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <style>{`
        .btn-reminder {
          border: 1px solid transparent;
          padding: 10px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .btn-reminder:hover { 
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow: 0 8px 16px -6px rgba(0,0,0,0.15);
        }
        .btn-reminder:active { transform: translateY(-0.5px); }
        
        .call-btn-pulse:hover {
          transform: scale(1.08) rotate(3deg);
          filter: brightness(1.05);
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(.33); }
          80%, 100% { opacity: 0; }
        }
      `}</style>
    </>
  );
};



export default function RecruiterDashboard() {
  const { tab = "dashboard" } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
    fetchCandidates(); // Always fetch for Global Reminders
  }, []); // Run once on mount

  // Reset selected candidate whenever the active tab changes
  useEffect(() => {
    setSelectedCandidate(null);
  }, [tab]);

  // Dynamic Recruiter Activity Ping Integration
  useEffect(() => {
    const pingActivity = async () => {
      let activity = "Working on CRM";
      if (tab === "dashboard") activity = "Active";
      else if (tab === "crm") activity = "Working on CRM";
      else if (tab === "jobs") activity = "Working on Jobs";
      else if (tab === "clients") activity = "Viewing Clients";
      else if (tab === "sourcing") activity = "Working on Sourcing Hub";
      else if (tab === "inbox") activity = "Unified Inbox Activity";
      else if (tab === "leads") activity = "Working on Leads";
      else if (tab === "todo") activity = "Updating Tasks";
      else if (tab === "tasks") activity = "Updating Tasks";
      else if (tab === "attendance") activity = "Checking Attendance";
      else if (tab === "performance") activity = "Checking Performance";
      else if (tab === "vendors") activity = "Working on Vendors";

      try {
        await fetch("/api/recruiter/activity-ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity })
        });
      } catch (err) {
        console.error("Failed to ping recruiter activity:", err);
      }
    };
    if (userProfile && userProfile.role === "recruiter") {
      pingActivity();
    }
  }, [tab, userProfile]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      const active = localStorage.getItem("crm_active_user");
      if (active) {
        try {
          setUserProfile(JSON.parse(active));
        } catch (e) {
          console.error("Failed to parse crm_active_user JSON", e);
        }
      }
    }
  };

  const fetchCandidates = async () => {
    setLoading(tab === "crm" || tab === "leads");
    try {
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error("Backend Protocol Error");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCandidates(data);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error("Failed to fetch", err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <DashboardHome candidates={candidates} currentUser={userProfile} onRefreshCandidates={fetchCandidates} onTabChange={(id) => navigate(`/dashboard/recruiter/${id}`)} />;
      case "crm": return <CRMView candidates={candidates} loading={loading} selectedCandidate={selectedCandidate} setSelectedCandidate={setSelectedCandidate} onRefresh={fetchCandidates} type="crm" currentUser={userProfile} />;
      case "jobs": return <Jobs role="recruiter" />;
      case "clients": return <Clients role="recruiter" candidatesProp={candidates} />;
      case "sourcing": return <SourcingHub role="recruiter" />;
      case "inbox": return <ReportingAI candidates={candidates} currentUser={userProfile} onRefresh={fetchCandidates} />;
      case "reverts": return <CandidateReverts candidates={candidates} currentUser={userProfile} onRefresh={fetchCandidates} role="recruiter" />;
      case "leads": return <LeadDataView candidates={candidates} currentUser={userProfile} onViewProfile={(c: any) => { setSelectedCandidate(c); navigate("/dashboard/recruiter/crm"); }} />;
      case "my-data": return <CRMView candidates={candidates} loading={loading} selectedCandidate={selectedCandidate} setSelectedCandidate={setSelectedCandidate} onRefresh={fetchCandidates} type="my-data" currentUser={userProfile} />;
      case "todo": return <MyToDoList />;
      case "tasks": return <MyTasks />;
      case "attendance": return <MyAttendance userId={userProfile?.id} userCreatedAt={userProfile?.createdAt} />;
      case "performance": return <MyPerformance currentUser={userProfile} candidates={candidates} />;
      case "vendors": return <MyVendors currentUser={userProfile} candidates={candidates} />;
      case "earned-gifts": return <EarnedGiftsCenter role="recruiter" />;
      case "incentives": return <RecruiterIncentiveTracker />;
      case "feedback": return <FeedbackTab currentUser={userProfile} />;
      case "profile": return <ProfileView role="recruiter" userId={userProfile?.id} />;
      default: return <DashboardHome candidates={candidates} currentUser={userProfile} onRefreshCandidates={fetchCandidates} onTabChange={(id) => navigate(`/dashboard/recruiter/${id}`)} />;
    }
  };

  return (
    <AdminLayout
      role="recruiter"
      userName={userProfile?.name || "Loading..."}
      activeTab={tab}
      onTabChange={(id) => navigate(`/dashboard/recruiter/${id}`)}
    >
      <ReminderSystem candidates={candidates} onRefresh={fetchCandidates} />
      <AnnouncementPopupSystem />
      <div key={tab} style={{ height: "100%", width: "100%" }}>
        {renderContent()}
      </div>
    </AdminLayout>
  );
}

const DashboardHome = ({ 
  candidates = [], 
  currentUser, 
  onRefreshCandidates, 
  onTabChange 
}: { 
  candidates?: any[], 
  currentUser?: any, 
  onRefreshCandidates?: () => void, 
  onTabChange?: (tab: string) => void 
}) => {
  const [attendance, setAttendance] = useState<any>(null);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [todoSearch, setTodoSearch] = useState("");
  const [reschedulingTodo, setReschedulingTodo] = useState<any>(null);
  const [newTodoDate, setNewTodoDate] = useState("");
  const [newTodoTime, setNewTodoTime] = useState("");
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [reportModal, setReportModal] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({ show: false, msg: "", type: "success" });
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"directives" | "collaboration">("directives");
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmittingAttachment, setIsSubmittingAttachment] = useState(false);
  const [showInterviewDoneModal, setShowInterviewDoneModal] = useState(false);
  const [interviewDoneFilter, setInterviewDoneFilter] = useState<"today" | "7days" | "1month" | "1year">("today");
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/jobs")
      .then(res => res.json())
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching jobs in DashboardHome:", err));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Setup Live Ticker (1-second tick)
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Poll Attendance Hub, Tasks, and Todo List (10-second sync)
  const syncData = async () => {
    if (onRefreshCandidates) {
      onRefreshCandidates();
    }

    if (currentUser?.id) {
      try {
        const res = await fetch(`/api/attendance/hub?date=${todayStr}&userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setAttendance(Array.isArray(data) && data.length > 0 ? data[0] : null);
        }
      } catch (e) {
        console.error("Dashboard Attendance sync error:", e);
      }
    }

    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        const loadedTasks = Array.isArray(data) ? data : [];
        setTasks(loadedTasks);
        
        // Auto-accept pending tasks
        loadedTasks.forEach(async (task: any) => {
          if (task.status?.toLowerCase() === "pending") {
            try {
              await fetch(`/api/tasks/${task.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "in_progress" })
              });
            } catch (err) {
              console.error("Auto-accept task failed:", err);
            }
          }
        });
      }
    } catch (e) {
      console.error("Dashboard Tasks sync error:", e);
    }

    const savedTodos = localStorage.getItem("givyansh_todo_tasks_v1");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (e) {
        console.error("Dashboard Todo List sync error:", e);
      }
    }
  };

  useEffect(() => {
    syncData();
    const syncInterval = setInterval(syncData, 10000);
    return () => clearInterval(syncInterval);
  }, [currentUser]);

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  // 3. Compute Real-Time Attendance Statistics
  const getLiveStats = () => {
    const currentShift = attendance?.shift || currentUser?.shift;
    if (!attendance || !currentShift) {
      return { 
        workedMins: 0, 
        breakMins: 0, 
        overtimeMins: 0, 
        status: "Offline", 
        currentSessionMins: 0, 
        activeLoginTime: null, 
        lastBreakDuration: 0,
        breaksCount: 0,
        regularShiftMins: 0
      };
    }

    const activeLog = attendance.logs?.find((l: any) => !l.logoutTime);
    const activeBreak = attendance.breaks?.find((b: any) => !b.endTime);

    let activeLoginTime = activeLog ? new Date(activeLog.loginTime) : null;
    let currentSessionMins = 0;
    if (activeLoginTime) {
      currentSessionMins = (new Date().getTime() - activeLoginTime.getTime()) / 60000;
    }

    let workedMins = 0;
    if (attendance.logs && Array.isArray(attendance.logs)) {
      attendance.logs.forEach((log: any) => {
        if (log.logoutTime) {
          workedMins += log.duration || 0;
        } else if (!activeBreak) {
          const elapsed = (new Date().getTime() - new Date(log.loginTime).getTime()) / 60000;
          workedMins += elapsed;
        }
      });
    }

    let breakMins = 0;
    let lastBreakDuration = 0;
    if (currentShift && currentShift.startTime) {
      const [sh, sm] = currentShift.startTime.split(':').map(Number);
      const now = new Date();
      const filteredBreaks = (attendance.breaks || []).map((b: any) => {
        const bStart = new Date(b.startTime);
        const bEnd = b.endTime ? new Date(b.endTime) : now;
        const shiftStartDate = new Date(bStart);
        shiftStartDate.setHours(sh, sm, 0, 0);

        let duration = 0;
        if (bStart < shiftStartDate) {
          if (bEnd > shiftStartDate) {
            duration = Math.max(0, (bEnd.getTime() - shiftStartDate.getTime()) / 60000);
          }
        } else {
          duration = (bEnd.getTime() - bStart.getTime()) / 60000;
        }
        return { ...b, duration };
      }).filter((b: any) => b.duration > 0);

      filteredBreaks.forEach((b: any) => {
        breakMins += b.duration;
      });

      if (filteredBreaks.length > 0) {
        lastBreakDuration = Math.round(filteredBreaks[filteredBreaks.length - 1].duration);
      }
    } else {
      breakMins = attendance.totalBreakTime || 0;
      if (activeBreak) {
        const elapsedBreakMins = (new Date().getTime() - new Date(activeBreak.startTime).getTime()) / 60000;
        breakMins += elapsedBreakMins;
      }
    }

    const reqMins = Math.round(parseFloat(currentShift.requiredHours || "8") * 60);
    let overtimeMins = 0;
    if (currentShift && currentShift.startTime && currentShift.endTime) {
      let earlyMins = 0;
      let lateMins = 0;

      const [sh, sm] = currentShift.startTime.split(':').map(Number);
      const [eh, em] = currentShift.endTime.split(':').map(Number);
      const now = new Date();

      if (attendance.logs && Array.isArray(attendance.logs)) {
        attendance.logs.forEach((log: any) => {
          const logStart = new Date(log.loginTime);
          const logEnd = log.logoutTime ? new Date(log.logoutTime) : now;

          const shiftStartDate = new Date(logStart);
          shiftStartDate.setHours(sh, sm, 0, 0);

          const shiftEndDate = new Date(logStart);
          shiftEndDate.setHours(eh, em, 0, 0);

          if (shiftEndDate < shiftStartDate) {
            shiftEndDate.setDate(shiftEndDate.getDate() + 1);
          }

          // Portions before shiftStartDate (Early Login Overtime)
          if (logStart < shiftStartDate) {
            const earlyEnd = logEnd < shiftStartDate ? logEnd : shiftStartDate;
            earlyMins += Math.max(0, (earlyEnd.getTime() - logStart.getTime()) / 60000);
          }

          // Portions after shiftEndDate (Late Logout Overtime)
          if (logEnd > shiftEndDate) {
            const lateStart = logStart > shiftEndDate ? logStart : shiftEndDate;
            lateMins += Math.max(0, (logEnd.getTime() - lateStart.getTime()) / 60000);
          }
        });
      }

      const overallDiff = workedMins > reqMins ? workedMins - reqMins : 0;
      overtimeMins = Math.max(earlyMins + lateMins, overallDiff);
    }

    let regularShiftMins = workedMins;
    if (currentShift && currentShift.startTime) {
      const [sh, sm] = currentShift.startTime.split(':').map(Number);
      const now = new Date();
      let regularWorkedMins = 0;

      attendance.logs?.forEach((log: any) => {
        const logStart = new Date(log.loginTime);
        const logEnd = log.logoutTime ? new Date(log.logoutTime) : now;

        const shiftStartDate = new Date(logStart);
        shiftStartDate.setHours(sh, sm, 0, 0);

        if (logEnd > shiftStartDate) {
          const start = logStart > shiftStartDate ? logStart : shiftStartDate;
          regularWorkedMins += (logEnd.getTime() - start.getTime()) / 60000;
        }
      });

      regularShiftMins = Math.max(0, regularWorkedMins - breakMins);
    }

    let status = "Offline";
    if (activeLog) {
      if (activeBreak) {
        status = "On Break";
      } else if (attendance.isIdle) {
        status = "Idle";
      } else if (workedMins >= reqMins) {
        status = "Overtime Running";
      } else {
        status = "Working";
      }
    } else if (attendance.loginTime) {
      status = "Shift Completed";
    }

    const breaksCount = attendance.breaks?.length || 0;

    return { workedMins, breakMins, overtimeMins, status, currentSessionMins, activeLoginTime, lastBreakDuration, breaksCount, regularShiftMins };
  };

  const live = getLiveStats();

  const formatMinsToSecondsStr = (totalMins: number) => {
    if (totalMins <= 0) return "00h 00m 00s";
    const totalSeconds = Math.floor(totalMins * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const formatMinsToSecondsHours = (totalMins: number) => {
    if (totalMins <= 0) return "00:00:00 h";
    const totalSeconds = Math.floor(totalMins * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} h`;
  };


  const toLocalDateStr = (dateInput: any) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayLocalStr = toLocalDateStr(new Date());

  const addedToday = candidates.filter((c: any) => {
    const sourcing = c.sourcingDate || c.createdAt;
    if (!sourcing) return false;
    const isCRM = c.dataType === "crm" || !c.dataType;
    return isCRM && toLocalDateStr(sourcing) === todayLocalStr;
  });

  const leadsAddedToday = candidates.filter((c: any) => {
    const sourcing = c.sourcingDate || c.createdAt;
    if (!sourcing) return false;
    return c.dataType === "lead" && toLocalDateStr(sourcing) === todayLocalStr;
  });

  const totalCands = candidates.filter((c: any) => c.dataType === "crm" || !c.dataType).length;
  const totalLeads = candidates.filter((c: any) => c.dataType === "lead").length;

  const getInterviewDetailedCounts = () => {
    let list = candidates;
    const now = new Date();
    
    if (interviewDoneFilter === "today") {
      list = addedToday;
    } else if (interviewDoneFilter === "7days") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = candidates.filter((c: any) => new Date(c.sourcingDate || c.createdAt) >= past);
    } else if (interviewDoneFilter === "1month") {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      list = candidates.filter((c: any) => new Date(c.sourcingDate || c.createdAt) >= past);
    } else if (interviewDoneFilter === "1year") {
      const past = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      list = candidates.filter((c: any) => new Date(c.sourcingDate || c.createdAt) >= past);
    }

    let r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0;
    let processing = 0;
    let completelyDone = 0;

    const getJobRounds = (c: any) => {
      const jobTitle = c.designation || c.jobRole || "";
      const foundJob = jobs.find((j: any) => j.title?.toLowerCase() === jobTitle.toLowerCase());
      return foundJob ? (foundJob.interviewRounds || 1) : 1;
    };

    list.forEach((c: any) => {
      const rmk = (c.remarks || "").toLowerCase();
      const jobRounds = getJobRounds(c);
      
      let currentRoundDone = 0;
      if (rmk.includes("round 5")) currentRoundDone = 5;
      else if (rmk.includes("round 4")) currentRoundDone = 4;
      else if (rmk.includes("round 3")) currentRoundDone = 3;
      else if (rmk.includes("round 2")) currentRoundDone = 2;
      else if (rmk.includes("round 1")) currentRoundDone = 1;

      if (rmk.includes("interview done") || rmk.includes("all round done") || rmk === "interview done") {
         completelyDone++;
      } else if (currentRoundDone > 0 && currentRoundDone >= jobRounds) {
         completelyDone++;
      } else if (rmk.includes("process for interview") || rmk.includes("processing for next round") || rmk.includes("processing") || rmk.includes("process")) {
         processing++;
      } else if (currentRoundDone === 1) {
         r1++;
      } else if (currentRoundDone === 2) {
         r2++;
      } else if (currentRoundDone === 3) {
         r3++;
      } else if (currentRoundDone === 4) {
         r4++;
      } else if (currentRoundDone === 5) {
         r5++;
      }
    });

    return { r1, r2, r3, r4, r5, processing, completelyDone };
  };

  const countByStatus = (statusName: string, isTodayOnly = false) => {
    const list = isTodayOnly ? addedToday : candidates;

    const checkHistory = (c: any, keywords: string[]) => {
      if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
        return c.InteractionNotes.some((n: any) => {
          const txt = (n.text || "").toLowerCase();
          return keywords.some(kw => txt.includes(kw));
        });
      }
      return false;
    };

    const isCandidateMatch = (c: any, stName: string) => {
      const rmk = (c.remarks || "").toLowerCase();
      const st = stName.toLowerCase().replace(/[\s_]+/g, "");
      if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;

      const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
      const hasInterviewHistory = 
        interviewStatuses.includes(rmk) || 
        !!c.interviewDate || 
        checkHistory(c, ["go for interview", "interview scheduled", "interview rescheduled", "interviewed", "selected", "joined", "hired", "process to joining", "process for joining", "dropped"]);

      if (st === "selected") {
        if (rmk === "rejected") return false;
        const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired", "after selection not interested"];
        return selectedStatuses.includes(rmk) || checkHistory(c, ["selected", "hired"]);
      }
      if (st === "joined" || st === "hired") {
        if (rmk === "dropped" || rmk === "rejected") return false;
        return rmk === "joined" || rmk === "hired";
      }
      if (st === "rejected") {
        const excludeFromRejected = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
        if (excludeFromRejected.includes(rmk)) return false;
        return rmk === "rejected";
      }
      if (st === "notinterested") {
        return rmk === "not interested";
      }
      if (st === "interested") {
        if (rmk === "not connected") return false;
        const interestedStatuses = ["interested", "selected", "joined", "dropped", "process to joining", "process for joining", "hired", "rejected"];
        return interestedStatuses.includes(rmk) || checkHistory(c, ["interested", "select", "join", "hired", "process"]);
      }
      if (st === "processtojoining" || st === "joining" || st === "processforjoining") {
        const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
        if (excludeFromJoining.includes(rmk)) return false;
        return rmk === "process to joining" || rmk === "process for joining" || rmk === "processing";
      }
      if (st === "connected") {
        if (hasInterviewHistory) return false;
        return rmk === "connected" || checkHistory(c, ["connected"]);
      }
      if (st === "notconnected") {
        return rmk === "not connected";
      }
      if (st === "revertlater") {
        return rmk === "revert later" || rmk === "call later";
      }
      if (st === "callnotpick") {
        return rmk === "call not pick" || rmk === "no response" || rmk === "busy";
      }
      if (st === "dropped") {
        return rmk === "dropped";
      }
      if (st === "goforinterview" || st === "interviewscheduled") {
        return hasInterviewHistory;
      }
      return false;
    };

    return list.filter((c: any) => isCandidateMatch(c, statusName)).length;
  };

  const getTaskDeadlineDate = (task: any) => {
    const now = new Date();
    if (!task.createdAt) return new Date(now.getTime() + 24 * 3600 * 1000);
    let deadlineDate = new Date(task.createdAt);
    const duration = task.duration || "today";
    if (duration === "today") {
      deadlineDate.setHours(23, 59, 59, 999);
    } else if (duration === "this_week") {
      const day = deadlineDate.getDay();
      const diff = deadlineDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(deadlineDate.setDate(diff));
      const sunday = new Date(monday.setDate(monday.getDate() + 6));
      sunday.setHours(23, 59, 59, 999);
      deadlineDate = sunday;
    } else if (duration === "this_month") {
      deadlineDate = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (duration === "this_year") {
      deadlineDate = new Date(deadlineDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (duration === "custom" && task.customEndDate) {
      deadlineDate = new Date(task.customEndDate);
      deadlineDate.setHours(23, 59, 59, 999);
    } else if (duration === "time_based") {
      if (task.deadlineTime) {
        const [h, m] = task.deadlineTime.split(":");
        deadlineDate.setHours(parseInt(h) || 18, parseInt(m) || 0, 0, 0);
      } else {
        deadlineDate.setHours(18, 0, 0, 0);
      }
    } else {
      deadlineDate.setHours(23, 59, 59, 999);
    }
    return deadlineDate;
  };

  const isTaskExpired = (task: any) => {
    const deadline = getTaskDeadlineDate(task);
    return new Date() > deadline;
  };

  const isActiveTask = (task: any) => {
    const status = task.status?.toLowerCase() || "pending";
    return !isTaskExpired(task) && status !== "completed" && status !== "cancelled";
  };

  const tasksPending = tasks.filter(t => t.status === "pending" || t.status === "Pending").length;
  const tasksActive = tasks.filter(t => t.status === "active" || t.status === "In Progress" || t.status === "in progress").length;
  const tasksCompleted = tasks.filter(t => t.status === "completed" || t.status === "Completed").length;
  const tasksPriority = tasks.filter(t => t.priority === "urgent" || t.priority === "high" || t.priority === "Urgent" || t.priority === "High").length;

  const getProductivityStatus = () => {
    if (live.status === "Offline") return "Low Activity";
    if (live.status === "On Break") return "On Break";
    if (live.status === "Overtime Running") return "Overtime Running";
    
    const addedCount = addedToday.length;
    if (addedCount >= 5) return "Highly Active";
    if (addedCount >= 2) return "Productive";
    if (live.workedMins > 60 && addedCount === 0) return "Low Activity";
    return "Productive";
  };

  const productivityStatus = getProductivityStatus();

  const [taskTab, setTaskTab] = useState<string>("all");
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null } : t));
        let statusFriendly = "updated";
        if (newStatus === "in_progress") statusFriendly = "accepted! 🚀";
        if (newStatus === "completed") statusFriendly = "completed! 🎉";
        if (newStatus === "cancelled") statusFriendly = "cancelled. 🚫";
        if (newStatus === "pending") statusFriendly = "reopened.";
        setToast({ show: true, msg: `Task successfully ${statusFriendly}`, type: "success" });
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (err: any) {
      console.error(err);
      setToast({ show: true, msg: err.message || "Failed to update task status.", type: "error" });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleMarkTodoComplete = (todoId: string) => {
    const updated = todos.map(t => {
      if (t.id === todoId) {
        return { 
          ...t, 
          status: "Completed" as const, 
          completedAt: Date.now(),
          history: [{ id: Date.now().toString(), action: "Completed", timestamp: Date.now(), details: "Completed from Recruiter Dashboard Home Quick Complete" }, ...t.history]
        };
      }
      return t;
    });
    setTodos(updated);
    localStorage.setItem("givyansh_todo_tasks_v1", JSON.stringify(updated));
    setToast({ show: true, msg: "Task completed successfully! 👍", type: "success" });
  };

  const handleOpenReschedule = (todo: any) => {
    setReschedulingTodo(todo);
    setNewTodoDate(todo.date);
    setNewTodoTime(todo.time);
  };

  const handleSaveReschedule = () => {
    if (!reschedulingTodo) return;
    const updated = todos.map(t => {
      if (t.id === reschedulingTodo.id) {
        return { 
          ...t, 
          date: newTodoDate, 
          time: newTodoTime,
          history: [{ id: Date.now().toString(), action: "Rescheduled", timestamp: Date.now(), details: `Rescheduled to ${newTodoDate} ${newTodoTime} from Dashboard Home` }, ...t.history]
        };
      }
      return t;
    });
    setTodos(updated);
    localStorage.setItem("givyansh_todo_tasks_v1", JSON.stringify(updated));
    setReschedulingTodo(null);
    setToast({ show: true, msg: "Task rescheduled successfully! 📅", type: "success" });
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      
      setCommentText("");
      // Re-fetch tasks to update the UI
      await syncData();
      // Also update selectedTask in local state to refresh the drawer content immediately
      const resTask = await fetch("/api/tasks");
      if (resTask.ok) {
        const latestTasks = await resTask.json();
        const updatedTask = latestTasks.find((t: any) => t.id === selectedTask.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
      setToast({ show: true, msg: "Comment successfully appended to timeline. 💬", type: "success" });
    } catch (err: any) {
      console.error(err);
      setToast({ show: true, msg: err.message || "Failed to add comment.", type: "error" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePostAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName.trim() || !attachmentUrl.trim() || !selectedTask) return;
    setIsSubmittingAttachment(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: attachmentName, url: attachmentUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post attachment");
      
      setAttachmentName("");
      setAttachmentUrl("");
      // Re-fetch tasks to update the UI
      await syncData();
      // Also update selectedTask in local state
      const resTask = await fetch("/api/tasks");
      if (resTask.ok) {
        const latestTasks = await resTask.json();
        const updatedTask = latestTasks.find((t: any) => t.id === selectedTask.id);
        if (updatedTask) setSelectedTask(updatedTask);
      }
      setToast({ show: true, msg: "Attachment successfully added. 📎", type: "success" });
    } catch (err: any) {
      console.error(err);
      setToast({ show: true, msg: err.message || "Failed to add attachment.", type: "error" });
    } finally {
      setIsSubmittingAttachment(false);
    }
  };

  const donutData = [
    { name: "Selected", value: countByStatus("Selected"), color: "#00f2fe" },
    { name: "Connected", value: countByStatus("Connected") + countByStatus("Go For Interview"), color: "#3b82f6" },
    { name: "Interested", value: countByStatus("Interested"), color: "#10b981" },
    { name: "Rejected", value: countByStatus("Rejected"), color: "#ef4444" },
    { name: "Joined", value: countByStatus("Joined"), color: "#a855f7" }
  ];

  const totalStatusCount = donutData.reduce((acc, curr) => acc + curr.value, 0);

  let accumulatedAngle = 0;
  const donutSlices = donutData.map((d, i) => {
    const percentage = totalStatusCount > 0 ? d.value / totalStatusCount : 0.2;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const rad = Math.PI / 180;
    const x1 = 100 + 70 * Math.cos((startAngle - 90) * rad);
    const y1 = 100 + 70 * Math.sin((startAngle - 90) * rad);
    const x2 = 100 + 70 * Math.cos((endAngle - 90) * rad);
    const y2 = 100 + 70 * Math.sin((endAngle - 90) * rad);

    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const bisectorAngle = startAngle + angle / 2;
    const dx = Math.cos((bisectorAngle - 90) * rad);
    const dy = Math.sin((bisectorAngle - 90) * rad);

    return {
      ...d,
      path: pathData,
      percentage: Math.round(percentage * 100),
      dx,
      dy
    };
  });

  const areaChartData = [
    { day: "Thu", work: 7.2, break: 0.6 },
    { day: "Fri", work: 8.5, break: 0.8 },
    { day: "Sat", work: 4.0, break: 0.4 },
    { day: "Mon", work: 7.8, break: 0.5 },
    { day: "Tue", work: 8.1, break: 0.7 },
    { day: "Wed", work: 9.0, break: 1.1 },
    { day: "Today", work: Math.round((live.workedMins / 60) * 10) / 10, break: Math.round((live.breakMins / 60) * 10) / 10 }
  ];

  const workCoords = areaChartData.map((d, i) => {
    const x = 50 + i * 95;
    const y = 190 - (d.work / 12) * 140; // Max 12h, bottom is 190, top is 50
    return { x, y, val: `${d.work}h` };
  });

  const breakCoords = areaChartData.map((d, i) => {
    const x = 50 + i * 95;
    const y = 190 - (d.break / 3) * 100; // Max 3h, bottom is 190, top is 90
    return { x, y, val: `${d.break}h` };
  });

  const getBezierPath = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + 45;
      const cpY1 = p0.y;
      const cpX2 = p1.x - 45;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const workLinePath = getBezierPath(workCoords);
  const workAreaPath = workCoords.length > 0 ? `${workLinePath} L ${workCoords[workCoords.length - 1].x} 190 L ${workCoords[0].x} 190 Z` : "";

  const breakLinePath = getBezierPath(breakCoords);
  const breakAreaPath = breakCoords.length > 0 ? `${breakLinePath} L ${breakCoords[breakCoords.length - 1].x} 190 L ${breakCoords[0].x} 190 Z` : "";

  const leadsCount = totalLeads + leadsAddedToday.length;
  const connectedCount = countByStatus("Connected") + countByStatus("Go For Interview") + countByStatus("Connected", true) + countByStatus("Go For Interview", true);
  const interestedCount = countByStatus("Interested") + countByStatus("Interested", true);
  const scheduledCount = countByStatus("Go For Interview") + countByStatus("Go For Interview", true);
  const selectedCount = countByStatus("Selected") + countByStatus("Selected", true);
  const joinedCount = countByStatus("Joined") + countByStatus("Joined", true);

  const maxVal = Math.max(leadsCount, 1);
  const getPct = (val: number) => Math.round((val / maxVal) * 100);

  const funnelSteps = [
    { stage: "Leads Generated", count: leadsCount, pct: 100, color: "#94a3b8" },
    { stage: "Connected", count: connectedCount, pct: getPct(connectedCount), color: "#3b82f6" },
    { stage: "Interested", count: interestedCount, pct: getPct(interestedCount), color: "#10b981" },
    { stage: "Scheduled", count: scheduledCount, pct: getPct(scheduledCount), color: "#f59e0b" },
    { stage: "Selected", count: selectedCount, pct: getPct(selectedCount), color: "#00f2fe" },
    { stage: "Joined", count: joinedCount, pct: getPct(joinedCount), color: "#a855f7" }
  ];

  const handleActionClick = (action: string) => {
    if (action === "add_candidate") {
      if (onTabChange) onTabChange("crm");
    } else if (action === "open_crm") {
      if (onTabChange) onTabChange("crm");
    } else if (action === "schedule_interview") {
      if (onTabChange) onTabChange("crm");
    } else if (action === "open_todo") {
      if (onTabChange) onTabChange("todo");
    } else if (action === "open_leads") {
      if (onTabChange) onTabChange("leads");
    } else if (action === "send_report") {
      setReportModal(true);
    }
  };

  const handleDispatchReport = () => {
    setReportModal(false);
    setToast({ show: true, msg: "Recruiter productivity report compiled and dispatched to command center! 🚀", type: "success" });
  };

  return (
    <div className="adv-rec-dashboard-wrapper">
      <AnimatePresence>
        {showInterviewDoneModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowInterviewDoneModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} style={{ background: "#fff", padding: "24px", borderRadius: "20px", width: "90%", maxWidth: "450px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>Interview Done Analytics</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>Detailed breakdown of interview rounds</p>
                </div>
                <button onClick={() => setShowInterviewDoneModal(false)} style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}><LucideX size={16} /></button>
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "#f8fafc", padding: "4px", borderRadius: "10px" }}>
                {["today", "7days", "1month", "1year"].map(f => (
                  <button key={f} onClick={() => setInterviewDoneFilter(f as any)} style={{ flex: 1, padding: "6px", fontSize: "0.75rem", fontWeight: 700, borderRadius: "8px", border: "none", cursor: "pointer", transition: "0.2s", background: interviewDoneFilter === f ? "#fff" : "transparent", color: interviewDoneFilter === f ? "#2563eb" : "#64748b", boxShadow: interviewDoneFilter === f ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}>
                    {f === "today" ? "Today" : f === "7days" ? "7 Days" : f === "1month" ? "1 Month" : "1 Year"}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(() => {
                  const counts = getInterviewDetailedCounts();
                  return [
                    { label: "Round 1 Done", count: counts.r1, color: "#3b82f6", bg: "#eff6ff" },
                    { label: "Round 2 Done", count: counts.r2, color: "#8b5cf6", bg: "#f5f3ff" },
                    { label: "Round 3 Done", count: counts.r3, color: "#ec4899", bg: "#fdf2f8" },
                    { label: "Round 4 Done", count: counts.r4, color: "#f59e0b", bg: "#fffbeb" },
                    { label: "Round 5 Done", count: counts.r5, color: "#ef4444", bg: "#fef2f2" },
                    { label: "Processing for next round", count: counts.processing, color: "#06b6d4", bg: "#ecfeff" },
                    { label: "All Round Done", count: counts.completelyDone, color: "#10b981", bg: "#ecfdf5" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", background: item.bg, border: `1px solid ${item.color}30` }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{item.label}</span>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: item.color }}>{item.count}</span>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        .adv-rec-dashboard-wrapper {
          padding: 1.5rem 2rem;
          background: #f8fafc;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          color: #1e293b;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          position: relative;
        }

        /* Custom Scrollbar for S-Class UI */
        .adv-rec-dashboard-wrapper::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .adv-rec-dashboard-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .adv-rec-dashboard-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 99px;
        }
        .adv-rec-dashboard-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Premium Light Theme Cards with Sheen Sweep */
        .premium-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.08), 0 2px 8px -1px rgba(148, 163, 184, 0.04);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .premium-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 12px 24px -4px rgba(148, 163, 184, 0.16), 0 4px 12px -2px rgba(148, 163, 184, 0.08);
        }

        /* Diagonal gloss sheen reflection */
        .premium-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.45),
            transparent
          );
          transform: skewX(-20deg);
          pointer-events: none;
        }

        .premium-card:hover::after {
          left: 150%;
          transition: all 0.85s ease-in-out;
        }

        .glowing-card {
          border: 1px solid #cbd5e1 !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) !important;
        }

        /* Professional Corporate Buttons */
        .btn-action-premium {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .btn-action-premium:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .btn-cyan-glow {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          border: none !important;
          color: #ffffff !important;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2) !important;
        }

        .btn-cyan-glow:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.25) !important;
        }

        /* HUD Header Design */
        .hud-header-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #2563eb;
          border-radius: 12px;
          padding: 0.85rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .hud-title-gradient {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #0f172a;
        }

        /* Dynamic Status Badges */
        .prod-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-highly-active {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .status-productive {
          background: #dbeafe;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .status-on-break {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }

        .status-low-activity {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .status-overtime {
          background: #f3e8ff;
          color: #6b21a8;
          border: 1px solid #e9d5ff;
        }

        /* KPI Icon Container */
        .kpi-icon-container {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .premium-card:hover .kpi-icon-container {
          transform: scale(1.05);
          background: #f1f5f9;
        }

        /* Glowing Text Styling */
        .glowing-metric-text {
          font-family: 'Space Grotesk', sans-serif;
          color: #0f172a;
          font-weight: 700;
        }

        /* Unique Slanted Blade Status Analytics Cards */
        .unique-status-pill {
          position: relative;
          overflow: hidden;
          border-radius: 28px 4px 28px 4px;
          padding: 1.15rem 0.8rem 1rem 0.8rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
          z-index: 1;
        }

        .unique-status-pill::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.45) 30%,
            rgba(255, 255, 255, 0.75) 50%,
            rgba(255, 255, 255, 0.45) 70%,
            transparent
          );
          transform: skewX(-25deg);
          transition: none;
          pointer-events: none;
          z-index: 2;
        }

        .unique-status-pill:hover {
          transform: translateY(-5px);
        }

        .unique-status-pill:hover::after {
          left: 150%;
          transition: all 0.85s ease;
        }

        .gemstone-icon-container {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          background: #ffffff;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
          z-index: 3;
        }

        .unique-status-pill:hover .gemstone-icon-container {
          transform: scale(1.15) rotate(12deg);
        }

        /* Selected Status */
        .status-pill-selected {
          border-color: rgba(37, 99, 235, 0.16);
          background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
        }
        .status-pill-selected:hover {
          border-color: rgba(37, 99, 235, 0.6);
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.12), 0 0 14px rgba(37, 99, 235, 0.08);
        }
        .status-pill-selected .gemstone-icon-container {
          color: #2563eb;
          border: 1.5px solid rgba(37, 99, 235, 0.25);
          background: linear-gradient(135deg, #ffffff, #eff6ff);
        }
        .status-pill-selected:hover .gemstone-icon-container {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-color: #2563eb;
          box-shadow: 0 0 8px rgba(37, 99, 235, 0.2);
        }
        .status-pill-selected-badge {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #dbeafe;
        }

        /* Connected Status */
        .status-pill-connected {
          border-color: rgba(59, 130, 246, 0.16);
          background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
        }
        .status-pill-connected:hover {
          border-color: rgba(59, 130, 246, 0.6);
          box-shadow: 0 10px 22px rgba(59, 130, 246, 0.12), 0 0 14px rgba(59, 130, 246, 0.08);
        }
        .status-pill-connected .gemstone-icon-container {
          color: #3b82f6;
          border: 1.5px solid rgba(59, 130, 246, 0.25);
          background: linear-gradient(135deg, #ffffff, #f0f7ff);
        }
        .status-pill-connected:hover .gemstone-icon-container {
          background: linear-gradient(135deg, #f0f7ff, #dbeafe);
          border-color: #3b82f6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
        }
        .status-pill-connected-badge {
          background: #f0f7ff;
          color: #1d4ed8;
          border: 1px solid #dbeafe;
        }

        /* Interested Status */
        .status-pill-interested {
          border-color: rgba(22, 163, 74, 0.16);
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
        }
        .status-pill-interested:hover {
          border-color: rgba(22, 163, 74, 0.6);
          box-shadow: 0 10px 22px rgba(22, 163, 74, 0.12), 0 0 14px rgba(22, 163, 74, 0.08);
        }
        .status-pill-interested .gemstone-icon-container {
          color: #16a34a;
          border: 1.5px solid rgba(22, 163, 74, 0.25);
          background: linear-gradient(135deg, #ffffff, #f0fdf4);
        }
        .status-pill-interested:hover .gemstone-icon-container {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-color: #16a34a;
          box-shadow: 0 0 8px rgba(22, 163, 74, 0.2);
        }
        .status-pill-interested-badge {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #dcfce7;
        }

        /* Rejected Status */
        .status-pill-rejected {
          border-color: rgba(220, 38, 38, 0.16);
          background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
        }
        .status-pill-rejected:hover {
          border-color: rgba(220, 38, 38, 0.6);
          box-shadow: 0 10px 22px rgba(220, 38, 38, 0.12), 0 0 14px rgba(220, 38, 38, 0.08);
        }
        .status-pill-rejected .gemstone-icon-container {
          color: #dc2626;
          border: 1.5px solid rgba(220, 38, 38, 0.25);
          background: linear-gradient(135deg, #ffffff, #fef2f2);
        }
        .status-pill-rejected:hover .gemstone-icon-container {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border-color: #dc2626;
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.2);
        }
        .status-pill-rejected-badge {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fee2e2;
        }

        /* Joined Status */
        .status-pill-joined {
          border-color: rgba(147, 51, 234, 0.16);
          background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%);
        }
        .status-pill-joined:hover {
          border-color: rgba(147, 51, 234, 0.6);
          box-shadow: 0 10px 22px rgba(147, 51, 234, 0.12), 0 0 14px rgba(147, 51, 234, 0.08);
        }
        .status-pill-joined .gemstone-icon-container {
          color: #9333ea;
          border: 1.5px solid rgba(147, 51, 234, 0.25);
          background: linear-gradient(135deg, #ffffff, #faf5ff);
        }
        .status-pill-joined:hover .gemstone-icon-container {
          background: linear-gradient(135deg, #faf5ff, #f3e8ff);
          border-color: #9333ea;
          box-shadow: 0 0 8px rgba(147, 51, 234, 0.2);
        }
        .status-pill-joined-badge {
          background: #faf5ff;
          color: #6b21a8;
          border: 1px solid #f3e8ff;
        }

        /* Custom Todo List UI */
        .todo-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .todo-item:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        /* SVG Donut Slices style */
        .donut-segment {
          transition: all 0.2s;
          cursor: pointer;
        }
        .donut-segment:hover {
          filter: brightness(0.95);
        }

        /* Toast Popup Overlay */
        .toast-notify {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 150000;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f172a;
          font-weight: 700;
          font-size: 0.82rem;
        }

        @keyframes pulsePurple {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        /* Responsive Layout Overrides */
        @media (max-width: 1200px) {
          .adv-grid-row-2 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .adv-rec-dashboard-wrapper {
            padding: 0.75rem;
            gap: 0.75rem;
          }
          .kpi-cards-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .status-analytics-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .quick-actions-row {
            flex-wrap: wrap !important;
          }
        }
      `}</style>
      {/* Shift card removed from main dashboard and moved to My Attendance tab */}
      {/* 3. Top Core KPIs Panel (4 Columns) */}
      <div className="kpi-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
        
        {/* KPI 1: Live Today Working Hours Card */}
        {(() => {
          const currentShift = attendance?.shift || currentUser?.shift;
          const shiftHours = currentShift ? parseFloat(currentShift.requiredHours || "8") : 0;
          const shiftTargetMins = shiftHours * 60;
          const shiftCompletionPercent = shiftHours > 0 ? Math.min(100, Math.round((live.regularShiftMins / (shiftTargetMins || 1)) * 100)) : 0;

          return (
            <div className="premium-card" style={{ padding: "0.85rem 0.95rem", display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Glowing Rounded Top accent border */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3.5px",
                background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                boxShadow: "0 1px 6px rgba(37, 99, 235, 0.35)"
              }} />

              {/* Left Side: Glowing Circular Progress */}
              <div style={{ position: "relative", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
                  <circle
                    cx="26"
                    cy="26"
                    r="20"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="4.5"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r="20"
                    fill="transparent"
                    stroke="url(#progressGlowGradient)"
                    strokeWidth="4.5"
                    strokeDasharray={125.66}
                    strokeDashoffset={125.66 - (shiftCompletionPercent / 100) * 125.66}
                    strokeLinecap="round"
                    style={{
                      filter: "drop-shadow(0px 0px 4px rgba(37, 99, 235, 0.45))",
                      transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  />
                  <defs>
                    <linearGradient id="progressGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: "absolute", fontSize: "0.72rem", fontWeight: 800, color: "#0f172a", fontFamily: "'Space Grotesk', 'Outfit', sans-serif", letterSpacing: "-0.3px" }}>
                  {shiftCompletionPercent}%
                </div>
              </div>

              {/* Right Side: Text & Metric Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 855, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Today Working Hours</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: live.status === "Offline" ? "#64748b" : "#16a34a", fontWeight: 700 }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: live.status === "Offline" ? "#64748b" : "#16a34a", display: "inline-block", animation: live.status === "Working" || live.status === "Overtime Running" ? "pulsePurple 1.5s infinite" : "none", boxShadow: live.status !== "Offline" ? "0 0 6px currentColor" : "none" }}></span>
                    {live.status === "Offline" ? "Offline" : live.status}
                  </span>
                </div>
                
                <h2 className="glowing-metric-text" style={{ fontSize: "1.15rem", fontWeight: 900, margin: "0 0 2px 0", fontFamily: "'Space Grotesk', 'Outfit', sans-serif", letterSpacing: "-0.5px", color: "#0f172a" }}>
                  {formatMinsToSecondsHours(live.regularShiftMins)}
                </h2>
                
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>
                  Shift: <span style={{ color: "#2563eb", fontWeight: 800 }}>{currentShift ? `${shiftHours}h target` : "No shift"}</span>
                </div>
              </div>
            </div>
          );
        })()}


        {/* KPI 2: Today Break Counts Card */}
        <div className="premium-card" style={{ padding: "0.85rem 0.95rem" }}>
          {/* Glowing Rounded Top accent border */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3.5px",
            background: "linear-gradient(90deg, #ea580c, #f97316)",
            boxShadow: "0 1px 6px rgba(234, 88, 12, 0.35)"
          }} />

          {/* Core Content Layout (Text left, Icon right) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 855, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Today Break Counts</span>
            
            {/* Glowing Icon Container (Gemstone theme) */}
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
              border: "1px solid #fed7aa",
              boxShadow: "0 2px 6px rgba(234, 88, 12, 0.15)",
              color: "#ea580c",
              flexShrink: 0
            }}>
              <LucideActivity size={16} style={{ filter: "drop-shadow(0px 1px 2px rgba(234, 88, 12, 0.15))" }} />
            </div>
          </div>
          
          <h2 className="glowing-metric-text" style={{ fontSize: "1.15rem", fontWeight: 900, margin: "0 0 4px 0", fontFamily: "'Space Grotesk', 'Outfit', sans-serif", letterSpacing: "-0.5px", color: "#0f172a" }}>
            Breaks: {live.breaksCount}
          </h2>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>
            <span>Total Break Time: <span style={{ color: "#ea580c", fontWeight: 800 }}>{Math.round(live.breakMins)}m</span></span>
            {live.status === "On Break" && (
              <span className="prod-badge status-on-break" style={{ padding: "1px 5px", fontSize: "0.58rem", borderRadius: "4px", lineHeight: "1" }}>Active</span>
            )}
          </div>
        </div>

        {/* KPI 3: Today Registered Candidate Count */}
        <div className="premium-card" style={{ padding: "0.85rem 0.95rem" }}>
          {/* Glowing Rounded Top accent border */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3.5px",
            background: "linear-gradient(90deg, #16a34a, #22c55e)",
            boxShadow: "0 1px 6px rgba(22, 163, 74, 0.35)"
          }} />

          {/* Core Content Layout (Text left, Icon right) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 855, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Registered Candidates</span>
            
            {/* Glowing Icon Container (Gemstone theme) */}
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              border: "1px solid #bbf7d0",
              boxShadow: "0 2px 6px rgba(22, 163, 74, 0.15)",
              color: "#16a34a",
              flexShrink: 0
            }}>
              <LucideUsers size={16} style={{ filter: "drop-shadow(0px 1px 2px rgba(22, 163, 74, 0.15))" }} />
            </div>
          </div>
          
          <h2 className="glowing-metric-text" style={{ fontSize: "1.15rem", fontWeight: 900, margin: "0 0 4px 0", fontFamily: "'Space Grotesk', 'Outfit', sans-serif", letterSpacing: "-0.5px", color: "#0f172a" }}>
            {addedToday.length} Candidates
          </h2>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>
            <span>Total CRM Pool: <span style={{ color: "#16a34a", fontWeight: 800 }}>{totalCands}</span></span>
            <span style={{ color: "#16a34a", fontWeight: 800 }}>+{Math.round((addedToday.length / (totalCands || 1)) * 1000) / 10}%</span>
          </div>
        </div>

        {/* KPI 4: Today Lead Generate Count */}
        <div className="premium-card" style={{ padding: "0.85rem 0.95rem" }}>
          {/* Glowing Rounded Top accent border */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3.5px",
            background: "linear-gradient(90deg, #9333ea, #a855f7)",
            boxShadow: "0 1px 6px rgba(147, 51, 234, 0.35)"
          }} />

          {/* Core Content Layout (Text left, Icon right) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 855, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Today Leads Generated</span>
            
            {/* Glowing Icon Container (Gemstone theme) */}
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #faf5ff, #f3e8ff)",
              border: "1px solid #e9d5ff",
              boxShadow: "0 2px 6px rgba(147, 51, 234, 0.15)",
              color: "#9333ea",
              flexShrink: 0
            }}>
              <LucideTrendingUp size={16} style={{ filter: "drop-shadow(0px 1px 2px rgba(147, 51, 234, 0.15))" }} />
            </div>
          </div>
          
          <h2 className="glowing-metric-text" style={{ fontSize: "1.15rem", fontWeight: 900, margin: "0 0 4px 0", fontFamily: "'Space Grotesk', 'Outfit', sans-serif", letterSpacing: "-0.5px", color: "#0f172a" }}>
            {leadsAddedToday.length} Leads
          </h2>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>
            <span>Total Lead Pool: <span style={{ color: "#9333ea", fontWeight: 800 }}>{totalLeads}</span></span>
            <span style={{ color: "#9333ea", fontWeight: 800 }}>Active pipeline</span>
          </div>
        </div>

      </div>

      {/* 4. Today Candidate Status Analytics (Selected, Connected, Interested, Rejected, Joined Cards) */}
      <div>
        <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "2px", background: "#2563eb" }}></span>
          Candidate Status Analytics
        </div>
        <div className="status-analytics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.85rem" }}>
          
          {/* Card: Selected */}
          <div className="unique-status-pill status-pill-selected">
            <div className="gemstone-icon-container">
              <LucideAward size={16} />
            </div>
            <div style={{ fontSize: "0.64rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Selected</div>
            <h3 style={{
              fontSize: "1.65rem",
              fontWeight: 900,
              color: "#2563eb",
              margin: "0 0 6px 0",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.5px",
              textShadow: "0 0 8px rgba(37, 99, 235, 0.2)"
            }}>
              {countByStatus("Selected", true)}
            </h3>
            <span className="status-pill-selected-badge" style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
              Lifetime: {countByStatus("Selected")}
            </span>
          </div>

          {/* Card: Connected */}
          <div className="unique-status-pill status-pill-connected">
            <div className="gemstone-icon-container">
              <LucidePhone size={16} />
            </div>
            <div style={{ fontSize: "0.64rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Connected</div>
            <h3 style={{
              fontSize: "1.65rem",
              fontWeight: 900,
              color: "#3b82f6",
              margin: "0 0 6px 0",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.5px",
              textShadow: "0 0 8px rgba(59, 130, 246, 0.2)"
            }}>
              {countByStatus("Connected", true) + countByStatus("Go For Interview", true)}
            </h3>
            <span className="status-pill-connected-badge" style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
              Lifetime: {countByStatus("Connected") + countByStatus("Go For Interview")}
            </span>
          </div>

          {/* Card: Interested */}
          <div className="unique-status-pill status-pill-interested">
            <div className="gemstone-icon-container">
              <LucideActivity size={16} />
            </div>
            <div style={{ fontSize: "0.64rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Interested</div>
            <h3 style={{
              fontSize: "1.65rem",
              fontWeight: 900,
              color: "#16a34a",
              margin: "0 0 6px 0",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.5px",
              textShadow: "0 0 8px rgba(22, 163, 74, 0.2)"
            }}>
              {countByStatus("Interested", true)}
            </h3>
            <span className="status-pill-interested-badge" style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
              Lifetime: {countByStatus("Interested")}
            </span>
          </div>

          {/* Card: Rejected */}
          <div className="unique-status-pill status-pill-rejected">
            <div className="gemstone-icon-container">
              <LucideXCircle size={16} />
            </div>
            <div style={{ fontSize: "0.64rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Rejected</div>
            <h3 style={{
              fontSize: "1.65rem",
              fontWeight: 900,
              color: "#dc2626",
              margin: "0 0 6px 0",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.5px",
              textShadow: "0 0 8px rgba(220, 38, 38, 0.2)"
            }}>
              {countByStatus("Rejected", true)}
            </h3>
            <span className="status-pill-rejected-badge" style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
              Lifetime: {countByStatus("Rejected")}
            </span>
          </div>

          {/* Card: Joined */}
          <div className="unique-status-pill status-pill-joined">
            <div className="gemstone-icon-container">
              <LucideRocket size={16} />
            </div>
            <div style={{ fontSize: "0.64rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Joined</div>
            <h3 style={{
              fontSize: "1.65rem",
              fontWeight: 900,
              color: "#9333ea",
              margin: "0 0 6px 0",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "-0.5px",
              textShadow: "0 0 8px rgba(147, 51, 234, 0.2)"
            }}>
              {countByStatus("Joined", true)}
            </h3>
            <span className="status-pill-joined-badge" style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
              Lifetime: {countByStatus("Joined")}
            </span>
          </div>

          {/* Card: Interview Done */}
          <div className="unique-status-pill" onClick={() => setShowInterviewDoneModal(true)} style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)", border: "1.5px solid #a7f3d0", borderRadius: "14px", padding: "0.85rem 0.75rem", display: "flex", flexDirection: "column", gap: "4px", position: "relative", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            <div className="gemstone-icon-container" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div style={{ fontSize: "0.64rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Interview Done</div>
            <h3 style={{ fontSize: "1.65rem", fontWeight: 900, color: "#10b981", margin: "0 0 6px 0", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.5px", textShadow: "0 0 8px rgba(16, 185, 129, 0.2)" }}>
              {countByStatus("Interview Done", true)}
            </h3>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px", background: "rgba(16,185,129,0.12)", color: "#059669" }}>
              Lifetime: {countByStatus("Interview Done")}
            </span>
          </div>

          {/* Card: Interview Not Done */}
          <div className="unique-status-pill" style={{ background: "linear-gradient(135deg, #fff1f2 0%, #fef2f2 100%)", border: "1.5px solid #fecdd3", borderRadius: "14px", padding: "0.85rem 0.75rem", display: "flex", flexDirection: "column", gap: "4px", position: "relative", overflow: "hidden" }}>
            <div className="gemstone-icon-container" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div style={{ fontSize: "0.64rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Interview Not Done</div>
            <h3 style={{ fontSize: "1.65rem", fontWeight: 900, color: "#ef4444", margin: "0 0 6px 0", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.5px", textShadow: "0 0 8px rgba(239, 68, 68, 0.2)" }}>
              {countByStatus("Interview Not Done", true)}
            </h3>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px", background: "rgba(239,68,68,0.12)", color: "#dc2626" }}>
              Lifetime: {countByStatus("Interview Not Done")}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Middle Grid: Donut Left + Big To Do List Right */}
      <div className="adv-grid-row-2" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.25rem" }}>

        {/* Left: Candidate Sourcing Ratio Donut */}
        <div className="premium-card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.2px" }}>Sourcing Ratio</h3>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            {/* SVG Donut */}
            <div style={{ width: "140px", height: "140px", flexShrink: 0, position: "relative" }}>
              <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)", overflow: "visible" }}>
                {donutSlices.map((slice, i) => {
                  const isHovered = hoveredSlice === i;
                  const shiftX = slice.dx * (isHovered ? 5 : 0);
                  const shiftY = slice.dy * (isHovered ? 5 : 0);
                  return (
                    <path key={i} d={slice.path} fill={slice.color} className="donut-segment"
                      style={{ color: slice.color, transform: `translate(${shiftX}px, ${shiftY}px) ${isHovered ? 'scale(1.04)' : 'scale(1)'}`, transformOrigin: "100px 100px", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
                      onMouseEnter={() => setHoveredSlice(i)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
                <circle cx="100" cy="100" r="54" fill="#ffffff" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ color: "#64748b", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {hoveredSlice !== null ? donutSlices[hoveredSlice].name : "TOTAL"}
                </span>
                <span style={{ color: "#0f172a", fontSize: "1.25rem", fontWeight: 950 }}>
                  {hoveredSlice !== null ? donutSlices[hoveredSlice].value : totalStatusCount}
                </span>
              </div>
            </div>
            {/* Legends */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
              {donutSlices.map((slice, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", fontSize: "0.75rem", background: hoveredSlice === i ? "#f1f5f9" : "transparent", padding: "4px 8px", borderRadius: "6px", transition: "all 0.2s" }}>
                  <span style={{ width: "8px", height: "8px", background: slice.color, borderRadius: "50%", marginRight: "8px", display: "inline-block", flexShrink: 0 }}></span>
                  <span style={{ color: hoveredSlice === i ? "#0f172a" : "#475569", fontWeight: 700, flex: 1 }}>{slice.name}</span>
                  <span style={{ fontWeight: 800, color: hoveredSlice === i ? slice.color : "#0f172a" }}>{slice.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: My Tasks + Big My To Do List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* My Tasks Interactive Dashboard Widget */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "4px solid #2563eb", borderRadius: "12px" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.2px" }}>My Operational Tasks</h3>
                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
                  {tasks.filter(isActiveTask).length} active directives assigned
                </span>
              </div>
              <span className="prod-badge status-productive" style={{ fontSize: "0.6rem", padding: "3px 8px", background: "#eff6ff", color: "#2563eb" }}>Active Directives</span>
            </div>

            {/* Tasks List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", maxHeight: "420px", minHeight: "220px", paddingRight: "2px", position: "relative" }}>
              {updatingTaskId !== null && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, borderRadius: "8px" }}>
                  <LucideLoader2 className="animate-spin" size={20} color="#2563eb" />
                </div>
              )}

              {tasks
                .filter(isActiveTask)
                .map((task) => {
                  const priority = task.priority?.toLowerCase() || "medium";
                  const status = task.status?.toLowerCase() || "pending";
                  const completionPct = task.targetQuantity ? Math.min(100, Math.round((task.completedQuantity / task.targetQuantity) * 100)) : 0;

                  const getPriorityColor = () => {
                    if (priority === "urgent") return "#dc2626";
                    if (priority === "high") return "#ea580c";
                    if (priority === "critical") return "#be123c";
                    if (priority === "low") return "#16a34a";
                    return "#2563eb";
                  };

                  const getStatusBadge = () => {
                    if (status === "in_progress") return { text: "Active", bg: "#eff6ff", color: "#2563eb" };
                    if (status === "completed") return { text: "Completed", bg: "#f0fdf4", color: "#16a34a" };
                    if (status === "overdue") return { text: "Overdue", bg: "#fef2f2", color: "#dc2626" };
                    if (status === "delayed") return { text: "Delayed", bg: "#fffbeb", color: "#d97706" };
                    if (status === "blocked") return { text: "Blocked", bg: "#fdf2f8", color: "#db2777" };
                    if (status === "under_review") return { text: "Review", bg: "#f5f3ff", color: "#7c3aed" };
                    if (status === "cancelled") return { text: "Cancelled", bg: "#f1f5f9", color: "#64748b" };
                    return { text: "Pending", bg: "#fffbeb", color: "#d97706" };
                  };

                  const pColor = getPriorityColor();
                  const badge = getStatusBadge();

                  // For master tasks, compute aggregate progress from subTasks
                  let masterCompletedQty = 0;
                  let masterTargetQty = 0;
                  let masterCompletionPct = 0;
                  if (task.taskType === "master" && task.subTasks && Array.isArray(task.subTasks)) {
                    task.subTasks.forEach((sub: any) => {
                      masterTargetQty += sub.targetQuantity || 0;
                      masterCompletedQty += sub.completedQuantity || 0;
                    });
                    masterCompletionPct = masterTargetQty > 0 ? Math.min(100, Math.round((masterCompletedQty / masterTargetQty) * 100)) : 0;
                  }

                  return (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "8px", 
                        padding: "12px 14px", 
                        borderRadius: "10px", 
                        background: status === "completed" ? "#fafffe" : status === "cancelled" ? "#fafafa" : "#ffffff", 
                        border: "1px solid #e2e8f0", 
                        borderLeft: `4px solid ${pColor}`,
                        cursor: "pointer",
                        opacity: status === "cancelled" ? 0.6 : 1,
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" 
                      }}
                      onMouseEnter={e => { 
                        e.currentTarget.style.borderColor = "#cbd5e1"; 
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.04)";
                      }}
                      onMouseLeave={e => { 
                        e.currentTarget.style.borderColor = "#e2e8f0"; 
                        e.currentTarget.style.background = status === "completed" ? "#fafffe" : status === "cancelled" ? "#fafafa" : "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Top Row: Title, Priority and Status Badges */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {task.title}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                          <span style={{ 
                            fontSize: "0.58rem", 
                            fontWeight: 900, 
                            padding: "1px 5px", 
                            borderRadius: "4px", 
                            background: badge.bg, 
                            color: badge.color, 
                            textTransform: "uppercase" 
                          }}>{badge.text}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#475569", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {task.description || "No description provided."}
                      </p>

                      {/* Progress Bar Widget for target tasks */}
                      {task.taskType === "target" && (
                        <div style={{ marginTop: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "#64748b", fontWeight: 700, marginBottom: "3px" }}>
                            <span>Progress: {task.completedQuantity || 0}/{task.targetQuantity || 0} {task.targetType}</span>
                            <span>{completionPct}%</span>
                          </div>
                          <div style={{ height: "4px", width: "100%", background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${completionPct}%`, background: completionPct >= 100 ? "#16a34a" : "#2563eb", borderRadius: "9999px" }}></div>
                          </div>
                        </div>
                      )}

                      {/* Progress Bar Widget for master tasks (aggregate) */}
                      {task.taskType === "master" && masterTargetQty > 0 && (
                        <div style={{ marginTop: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "#64748b", fontWeight: 700, marginBottom: "3px" }}>
                            <span>Progress: {masterCompletedQty}/{masterTargetQty} ({task.subTasks?.length || 0} targets)</span>
                            <span>{masterCompletionPct}%</span>
                          </div>
                          <div style={{ height: "4px", width: "100%", background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${masterCompletionPct}%`, background: masterCompletionPct >= 100 ? "#16a34a" : "#2563eb", borderRadius: "9999px" }}></div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Row: Assigner */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, marginTop: "2px" }}>
                        <div>
                          By: <span style={{ color: "#2563eb", fontWeight: 800 }}>{task.assigner?.name || "Admin"}</span>
                        </div>
                        <div style={{ color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                          <LucideEye size={11} />
                          <span>View details</span>
                        </div>
                      </div>

                    </div>
                  );
                })}

              {tasks.filter(isActiveTask).length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 10px", textAlign: "center", height: "100%" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", marginBottom: "10px" }}>
                    <LucideCheckCircle2 size={20} />
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#64748b" }}>No tasks assigned yet!</span>
                </div>
              )}
            </div>

          </div>

          {/* Big My To Do List */}
          <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {/* Glowing green top border */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3.5px", background: "linear-gradient(90deg, #16a34a, #22c55e, #4ade80)", boxShadow: "0 1px 8px rgba(22,163,74,0.35)", borderRadius: "12px 12px 0 0" }} />

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.2px" }}>My To Do List</h3>
              <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
                {todos.filter(t => t.status !== "Completed" && t.status !== "Skipped").length} pending · {todos.filter(t => t.status === "Completed").length} done
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "5px 10px" }}>
                <LucideSearch size={11} color="#64748b" />
                <input type="text" placeholder="Filter tasks..." value={todoSearch}
                  onChange={(e) => setTodoSearch(e.target.value)}
                  style={{ border: "none", background: "none", outline: "none", fontSize: "0.75rem", color: "#0f172a", width: "90px" }}
                />
              </div>
              <button onClick={() => handleActionClick("open_todo")} style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                <LucideListTodo size={12} /> Full List
              </button>
            </div>
          </div>

          {/* Todo Items - expanded, no slice limit */}
          <div style={{ display: "flex", flexDirection: "column", gap: "7px", overflowY: "auto", maxHeight: "520px", paddingRight: "2px" }}>
            {todos
              .filter(t => t.status !== "Completed" && t.status !== "Skipped")
              .filter(t => t.title.toLowerCase().includes(todoSearch.toLowerCase()) || t.category.toLowerCase().includes(todoSearch.toLowerCase()))
              .map((todo) => (
                <div key={todo.id} className="todo-item" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: "#ffffff", border: "1px solid #e2e8f0", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#ffffff"; }}
                >
                  {/* Priority dot */}
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0, background: todo.priority === "Urgent" ? "#dc2626" : todo.priority === "High" ? "#ea580c" : "#2563eb", boxShadow: `0 0 5px ${todo.priority === "Urgent" ? "#dc262660" : todo.priority === "High" ? "#ea580c60" : "#2563eb60"}` }} />
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{todo.title}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.65rem", color: "#64748b", fontWeight: 700, marginTop: "2px" }}>
                      <span style={{ color: todo.priority === "Urgent" ? "#dc2626" : todo.priority === "High" ? "#ea580c" : "#2563eb", background: todo.priority === "Urgent" ? "#fef2f2" : todo.priority === "High" ? "#fff7ed" : "#eff6ff", padding: "1px 6px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 800 }}>{todo.priority}</span>
                      <span style={{ color: "#94a3b8" }}>•</span>
                      <span>{todo.date} {todo.time && `at ${todo.time}`}</span>
                      {todo.category && <><span style={{ color: "#94a3b8" }}>•</span><span style={{ color: "#64748b" }}>{todo.category}</span></>}
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button onClick={() => handleMarkTodoComplete(todo.id)} title="Mark Complete"
                      style={{ border: "none", background: "#f0fdf4", padding: "5px", borderRadius: "6px", color: "#16a34a", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#dcfce7"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      <LucideCheckCircle2 size={15} />
                    </button>
                    <button onClick={() => handleOpenReschedule(todo)} title="Reschedule"
                      style={{ border: "none", background: "#fff7ed", padding: "5px", borderRadius: "6px", color: "#ea580c", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fed7aa"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#fff7ed"; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      <LucideClock size={15} />
                    </button>
                  </div>
                </div>
              ))}
            {todos.filter(t => t.status !== "Completed" && t.status !== "Skipped").length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", marginBottom: "12px" }}>
                  <LucideCheckCircle2 size={26} />
                </div>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: 700 }}>All tasks completed!</p>
                <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: "4px 0 0 0" }}>Your agenda is clear for today.</p>
              </div>
            )}
          </div>
          </div>

        </div>

      </div>


      {/* 7. Modal rescheduler overlay */}
      {reschedulingTodo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200000, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="premium-card" style={{ maxWidth: "400px", width: "100%", padding: "2rem", border: "1px solid #cbd5e1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.4px" }}>Reschedule Directive</h3>
              <button 
                onClick={() => setReschedulingTodo(null)}
                style={{ border: "none", background: "none", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
              >
                <LucideX size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: "0.82rem", color: "#475569", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Rescheduling task: <span style={{ color: "#2563eb", fontWeight: 800 }}>{reschedulingTodo.title}</span>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "2rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Select New Date</label>
                <input 
                  type="date" 
                  value={newTodoDate}
                  onChange={(e) => setNewTodoDate(e.target.value)}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 10px", color: "#0f172a", outline: "none", fontSize: "0.85rem" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Select New Time</label>
                <input 
                  type="time" 
                  value={newTodoTime}
                  onChange={(e) => setNewTodoTime(e.target.value)}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 10px", color: "#0f172a", outline: "none", fontSize: "0.85rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setReschedulingTodo(null)} className="btn-action-premium" style={{ borderColor: "#cbd5e1", color: "#334155", padding: "8px 14px" }}>Cancel</button>
              <button onClick={() => handleSaveReschedule()} className="btn-action-premium btn-cyan-glow" style={{ padding: "8px 14px" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Report compilation modal */}
      {reportModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200000, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="premium-card" style={{ maxWidth: "420px", width: "100%", padding: "2.5rem", textAlign: "center", border: "1px solid #cbd5e1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", background: "#ffffff" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", margin: "0 auto 1.5rem", border: "1px solid #bfdbfe" }}>
              <LucideMail size={28} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: "0 0 10px 0", letterSpacing: "-0.4px" }}>Compile Productivity Report</h3>
            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, margin: "0 0 2rem 0" }}>
              This will compile your daily KPIs, attendance parameters, lead status movements, and candidate selection index into a structured corporate briefing report and transmit it directly to your Reporting TL (<span style={{ color: "#0f172a", fontWeight: 700 }}>Deepa Sidhnani</span>).
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setReportModal(false)} className="btn-action-premium" style={{ borderColor: "#cbd5e1", color: "#334155" }}>Cancel</button>
              <button onClick={() => handleDispatchReport()} className="btn-action-premium btn-cyan-glow">Compile & Dispatch</button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Dynamic Toast Notification */}
      {toast.show && (
        <div className="toast-notify animate-bounce">
          <LucideCheckCircle2 size={16} color="#16a34a" style={{ strokeWidth: 3 }} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* DETAILED TASK INSPECTOR DRAWER */}
      <AnimatePresence>
        {selectedTask && (() => {
          const comments = safeParseArray(selectedTask.comments);
          const attachments = safeParseArray(selectedTask.attachments);
          const historyList = safeParseArray(selectedTask.history);
          const completionPct = selectedTask.targetQuantity ? Math.min(100, Math.round((selectedTask.completedQuantity / selectedTask.targetQuantity) * 100)) : 0;
          
          // Target split calculations
          const totalDistributed = selectedTask.subTasks ? selectedTask.subTasks.reduce((sum: number, s: any) => sum + (s.targetQuantity || 0), 0) : 0;
          const remainingTarget = Math.max(0, selectedTask.targetQuantity - totalDistributed);
          const distributedPct = selectedTask.targetQuantity ? Math.round((totalDistributed / selectedTask.targetQuantity) * 100) : 0;

          // Recursive Helpers and Calculations local to this view
          const getAllDescendants = (task: any): any[] => {
            const list: any[] = [];
            if (task.subTasks && Array.isArray(task.subTasks)) {
              task.subTasks.forEach((sub: any) => {
                list.push(sub);
                list.push(...getAllDescendants(sub));
              });
            }
            return list;
          };

          const descendants = getAllDescendants(selectedTask);
          
          // Remaining & Deadline Calculation
          const now = new Date();
          let deadlineDate = new Date(selectedTask.createdAt || now);
          if (selectedTask.duration === "today") {
            deadlineDate.setHours(23, 59, 59, 999);
          } else if (selectedTask.duration === "this_week") {
            const first = now.getDate() - now.getDay() + 1;
            deadlineDate = new Date(now.setDate(first + 6));
            deadlineDate.setHours(23, 59, 59, 999);
          } else if (selectedTask.duration === "this_month") {
            deadlineDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          } else if (selectedTask.duration === "this_year") {
            deadlineDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          } else if (selectedTask.duration === "custom" && selectedTask.customEndDate) {
            deadlineDate = new Date(selectedTask.customEndDate);
            deadlineDate.setHours(23, 59, 59, 999);
          } else if (selectedTask.duration === "time_based" && selectedTask.deadlineTime) {
            const [h, m] = selectedTask.deadlineTime.split(":");
            deadlineDate.setHours(parseInt(h) || 18, parseInt(m) || 0, 0, 0);
          } else {
            deadlineDate.setHours(18, 0, 0, 0);
          }

          const diffMs = deadlineDate.getTime() - now.getTime();
          const isOverdue = diffMs < 0;
          const absDiff = Math.abs(diffMs);
          const diffDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

          let countdownText = "";
          let countdownColor = "#16a34a"; // green
          let isNearDeadline = false;

          if (isOverdue) {
            countdownText = `OVERDUE BY ${diffDays}d ${diffHours}h`;
            countdownColor = "#ef4444"; // red
          } else {
            if (diffDays === 0) {
              countdownText = `${diffHours}h remaining`;
              isNearDeadline = diffHours <= 3;
              countdownColor = isNearDeadline ? "#ef4444" : "#f59e0b"; // red / yellow
            } else {
              countdownText = `${diffDays}d ${diffHours}h remaining`;
              countdownColor = diffDays <= 1 ? "#f59e0b" : "#16a34a";
            }
          }

          // Determine final logical status
          let calculatedStatus = selectedTask.status || "pending";
          if (calculatedStatus !== "completed" && calculatedStatus !== "cancelled") {
            if (isOverdue) {
              calculatedStatus = "overdue";
            } else if (isNearDeadline) {
              calculatedStatus = "near_deadline";
            }
          }

          const getStatusLabelAndBg = (statusStr: string) => {
            const s = statusStr.toLowerCase();
            if (s === "completed") return { text: "Completed", bg: "#dcfce7", color: "#16a34a" };
            if (s === "near_deadline") return { text: "Near Deadline", bg: "#fef2f2", color: "#ef4444" };
            if (s === "overdue") return { text: "Overdue", bg: "#fee2e2", color: "#dc2626" };
            if (s === "delayed") return { text: "Delayed", bg: "#fffbeb", color: "#d97706" };
            if (s === "blocked") return { text: "Blocked / Issue", bg: "#fdf2f8", color: "#db2777" };
            if (s === "under_review") return { text: "Under Review", bg: "#f5f3ff", color: "#7c3aed" };
            return { text: "In Progress", bg: "#e0f2fe", color: "#0284c7" };
          };
          const statusIndicator = getStatusLabelAndBg(calculatedStatus);

          // Gather list of targets for multi-target tracking section
          const targetMetrics = [];
          if (selectedTask.taskType === "master") {
            if (selectedTask.subTasks && Array.isArray(selectedTask.subTasks)) {
              targetMetrics.push(...selectedTask.subTasks.filter((t: any) => t.taskType === "target"));
            }
          } else if (selectedTask.taskType === "target") {
            targetMetrics.push(selectedTask);
          }

          // Aggregate Team Contribution Breakdown (Hierarchical Roll-up)
          const teamContributionsMap: Record<string, { name: string; role: string; assigned: number; completed: number; status: string; count: number; delayedCount: number }> = {};
          
          descendants.forEach((sub: any) => {
            if (sub.assignee) {
              const uName = sub.assignee.name;
              if (!teamContributionsMap[uName]) {
                teamContributionsMap[uName] = {
                  name: uName,
                  role: sub.assignee.role,
                  assigned: 0,
                  completed: 0,
                  status: sub.status,
                  count: 0,
                  delayedCount: 0
                };
              }
              teamContributionsMap[uName].assigned += sub.targetQuantity || 0;
              teamContributionsMap[uName].completed += sub.completedQuantity || 0;
              teamContributionsMap[uName].count += 1;
              if (sub.status === "delayed" || sub.status === "overdue") {
                teamContributionsMap[uName].delayedCount += 1;
                teamContributionsMap[uName].status = sub.status;
              }
            }
          });
          const teamContributionsList = Object.values(teamContributionsMap);

          // Aggregate counts
          const totalAssignedSubtasks = teamContributionsList.reduce((sum, member) => sum + member.assigned, 0);
          const totalCompletedSubtasks = teamContributionsList.reduce((sum, member) => sum + member.completed, 0);
          const teamPerformanceRatio = totalAssignedSubtasks > 0 
            ? Math.round((totalCompletedSubtasks / totalAssignedSubtasks) * 100) 
            : 100;
          const pendingSubtargetsCount = teamContributionsList.reduce((sum, member) => sum + (member.assigned - member.completed), 0);
          const delayedSubtargetsCount = teamContributionsList.reduce((sum, member) => sum + member.delayedCount, 0);

          const priority = selectedTask.priority?.toLowerCase() || "medium";
          const priorityColor = priority === "urgent" ? "#dc2626" : priority === "high" ? "#ea580c" : priority === "low" ? "#16a34a" : "#2563eb";
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.3)",
                backdropFilter: "blur(4px)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "flex-end"
              }}
            >
              {/* Drawer Container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "white",
                  width: "100%",
                  maxWidth: "580px",
                  height: "100vh",
                  boxShadow: "-10px 0 40px -15px rgba(0,0,0,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: "1px solid #e0f2fe",
                  overflowY: "auto"
                }}
              >
                {/* Drawer Header */}
                <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.9 }}>
                      <LucideClipboardList size={14} /> Operational Directive Profile
                    </div>
                    <h3 style={{ margin: "6px 0 0", fontSize: "1.1rem", fontWeight: "900", letterSpacing: "-0.5px" }}>{selectedTask.title}</h3>
                  </div>
                  <button onClick={() => setSelectedTask(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", color: "white", width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LucideX size={18} />
                  </button>
                </div>

                {/* Drawer Tab Switcher */}
                <div style={{ display: "flex", borderBottom: "1.5px solid #f1f5f9", padding: "0 10px", background: "#f8fafc" }}>
                  {[
                    { id: "directives", label: "Directives & Analytics" },
                    { id: "collaboration", label: "Collaboration & History" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setInspectorTab(tab.id as any)}
                      style={{
                        padding: "14px 20px",
                        background: "transparent",
                        border: "none",
                        borderBottom: inspectorTab === tab.id ? "3px solid #2563eb" : "3px solid transparent",
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: inspectorTab === tab.id ? "#2563eb" : "#64748b",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Drawer Contents */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
                  
                  {inspectorTab === "directives" && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        
                        {/* --- MASTER KPI DASHBOARD CARD --- */}
                        <div style={{ 
                          background: "rgba(255, 255, 255, 0.9)",
                          border: "1.5px solid #e0f2fe",
                          borderRadius: "24px",
                          padding: "20px 24px",
                          boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.12), 0 1px 2px rgba(37, 99, 235, 0.05)",
                          display: "flex",
                          gap: "24px",
                          alignItems: "center",
                          position: "relative",
                          overflow: "hidden"
                        }}>
                          {/* Left side: Circular Progress */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <svg width="90" height="90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke="#f1f5f9"
                                strokeWidth="8"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke="url(#inspectorProgressGradDashboard)"
                                strokeWidth="8"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (completionPct / 100) * 251.2}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 0.6s ease" }}
                              />
                              <defs>
                                <linearGradient id="inspectorProgressGradDashboard" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#2563eb" />
                                  <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                              </defs>
                              <text
                                x="50"
                                y="56"
                                textAnchor="middle"
                                fontSize="18"
                                fontWeight="900"
                                fill="#1e293b"
                              >
                                {completionPct}%
                              </text>
                            </svg>
                            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Overall Completion</span>
                          </div>

                          {/* Right side: Summary Details */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                              <span style={{ 
                                background: statusIndicator.bg, 
                                color: statusIndicator.color, 
                                padding: "4px 10px", 
                                borderRadius: "8px", 
                                fontSize: "0.72rem", 
                                fontWeight: 900, 
                                textTransform: "uppercase",
                                border: `1px solid ${statusIndicator.color}15`
                              }}>
                                {statusIndicator.text}
                              </span>
                              <span style={{ 
                                background: "#f1f5f9", 
                                color: "#475569", 
                                padding: "4px 8px", 
                                borderRadius: "8px", 
                                fontSize: "0.72rem", 
                                fontWeight: 800,
                                textTransform: "capitalize"
                              }}>
                                {selectedTask.priority} Priority
                              </span>
                            </div>

                            <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 500, lineHeight: 1.4 }}>
                              Assigned by <strong style={{ color: "#1e3a8a" }}>{selectedTask.assigner?.name}</strong> • Origin: <span style={{ textTransform: "uppercase", fontSize: "0.72rem", fontWeight: 800, color: "#2563eb" }}>{selectedTask.assigner?.role} node</span>
                            </div>

                            {/* Countdown tracker */}
                            <div style={{ 
                              background: isOverdue ? "#fff1f2" : "#f0fdf4", 
                              border: `1px solid ${isOverdue ? "#fee2e2" : "#dcfce7"}`, 
                              padding: "8px 12px", 
                              borderRadius: "12px", 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center"
                            }}>
                              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isOverdue ? "#e11d48" : "#16a34a", display: "flex", alignItems: "center", gap: "6px" }}>
                                <LucideClock size={14} /> {countdownText.toUpperCase()}
                              </span>
                              <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
                                Deadline: {selectedTask.duration === "custom" && selectedTask.customEndDate 
                                  ? selectedTask.customEndDate 
                                  : (selectedTask.duration === "time_based" ? `Today at ${selectedTask.deadlineTime || "18:00"}` : selectedTask.duration?.toUpperCase().replace('_', ' '))
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* --- Directive Profile Metadata Grid --- */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                          gap: "12px",
                          background: "#f8fafc",
                          padding: "16px",
                          borderRadius: "20px",
                          border: "1px solid #e2e8f0"
                        }}>
                          <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>CURRENT STATUS</div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 950, color: statusIndicator.color, textTransform: "uppercase", marginTop: "4px" }}>{statusIndicator.text}</div>
                          </div>
                          <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>COMPLETION %</div>
                            <div style={{ fontSize: "0.95rem", fontWeight: 950, color: "#7c3aed", marginTop: "4px" }}>{completionPct}%</div>
                          </div>
                          <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>DEADLINE</div>
                            <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
                              {selectedTask.duration === "custom" && selectedTask.customEndDate 
                                ? selectedTask.customEndDate 
                                : (selectedTask.duration === "time_based" ? `Today at ${selectedTask.deadlineTime || "18:00"}` : selectedTask.duration?.toUpperCase().replace('_', ' '))
                              }
                            </div>
                          </div>
                          <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>REMAINING TIME</div>
                            <div style={{ fontSize: "0.8rem", fontWeight: 900, color: countdownColor, marginTop: "4px" }}>{countdownText}</div>
                          </div>
                          <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>COMPLETED TARGETS</div>
                            <div style={{ fontSize: "0.95rem", fontWeight: 950, color: "#16a34a", marginTop: "4px" }}>
                              {selectedTask.taskType === "master" ? totalCompletedSubtasks : (selectedTask.completedQuantity || 0)}
                            </div>
                          </div>
                          <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>PENDING TARGETS</div>
                            <div style={{ fontSize: "0.95rem", fontWeight: 950, color: "#ef4444", marginTop: "4px" }}>
                              {selectedTask.taskType === "master"
                                ? Math.max(0, totalAssignedSubtasks - totalCompletedSubtasks)
                                : Math.max(0, (selectedTask.targetQuantity || 0) - (selectedTask.completedQuantity || 0))
                              }
                            </div>
                          </div>
                          <div style={{ background: "white", padding: "10px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>EXPIRED STATE</div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 950, color: isOverdue ? "#ef4444" : "#16a34a", marginTop: "4px" }}>
                              {isOverdue ? "EXPIRED" : "ACTIVE"}
                            </div>
                          </div>
                        </div>

                        {/* --- MULTI-TARGET TRACKING SECTION --- */}
                        {targetMetrics.length > 0 && (
                          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "20px", borderRadius: "24px" }}>
                            <h4 style={{ margin: "0 0 14px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                              <LucideTrendingUp size={16} color="#2563eb" /> Multi-Target Tracking Metrics
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {targetMetrics.map((task: any) => {
                                const taskCompPct = task.targetQuantity ? Math.min(100, Math.round((task.completedQuantity / task.targetQuantity) * 100)) : 0;
                                const remaining = Math.max(0, task.targetQuantity - task.completedQuantity);
                                
                                return (
                                  <div key={task.id} style={{ 
                                    background: "white", 
                                    padding: "16px", 
                                    borderRadius: "18px", 
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
                                  }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: taskCompPct >= 100 ? "#16a34a" : "#2563eb" }}></div>
                                        <span style={{ fontSize: "0.9rem", fontWeight: "900", color: "#0f172a", textTransform: "uppercase" }}>
                                          {task.targetType || "Metric Target"}
                                        </span>
                                        {task.assignee && (
                                          <span style={{ fontSize: "0.7rem", fontWeight: "800", background: "#eff6ff", color: "#1e3a8a", padding: "2px 6px", borderRadius: "4px", marginLeft: "8px", border: "1px solid #bfdbfe" }}>
                                            {task.assignee.name.toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      <span style={{ fontSize: "0.82rem", fontWeight: "900", color: taskCompPct >= 100 ? "#16a34a" : "#2563eb" }}>
                                        {taskCompPct}% Achieved
                                      </span>
                                    </div>

                                    {/* Quantities Row */}
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px", textAlign: "center" }}>
                                      <div style={{ background: "#f8fafc", padding: "6px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                                        <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#64748b" }}>ASSIGNED</div>
                                        <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#1e293b" }}>{task.targetQuantity}</div>
                                      </div>
                                      <div style={{ background: "#f0fdf4", padding: "6px", borderRadius: "8px", border: "1px solid #dcfce7" }}>
                                        <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#16a34a" }}>COMPLETED</div>
                                        <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#16a34a" }}>{task.completedQuantity}</div>
                                      </div>
                                      <div style={{ background: remaining > 0 ? "#fef2f2" : "#f0fdf4", padding: "6px", borderRadius: "8px", border: `1px solid ${remaining > 0 ? "#fee2e2" : "#dcfce7"}` }}>
                                        <div style={{ fontSize: "0.58rem", fontWeight: 800, color: remaining > 0 ? "#ef4444" : "#16a34a" }}>REMAINING</div>
                                        <div style={{ fontSize: "0.95rem", fontWeight: 900, color: remaining > 0 ? "#ef4444" : "#16a34a" }}>{remaining}</div>
                                      </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                                      <div style={{ 
                                        width: `${taskCompPct}%`, 
                                        height: "100%", 
                                        background: "linear-gradient(90deg, #2563eb 0%, #10b981 100%)", 
                                        borderRadius: "4px",
                                        transition: "width 0.4s ease"
                                      }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* --- RECRUITER TARGET PERFORMANCE CARD --- */}
                        {currentUser && currentUser.role === "recruiter" && (
                          <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", padding: "20px", borderRadius: "24px" }}>
                            <h4 style={{ margin: "0 0 12px", fontSize: "0.85rem", fontWeight: "900", color: "#1e3a8a", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                              <LucideActivity size={16} color="#2563eb" /> Recruiter Personalized Performance Card
                            </h4>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px", textAlign: "center" }}>
                              <div style={{ background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                                <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b" }}>MY TARGET</div>
                                <div style={{ fontSize: "1rem", fontWeight: 950, color: "#1e3a8a" }}>{selectedTask.targetQuantity || 0}</div>
                              </div>
                              <div style={{ background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                                <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b" }}>MY COMPLETED</div>
                                <div style={{ fontSize: "1rem", fontWeight: 950, color: "#16a34a" }}>{selectedTask.completedQuantity || 0}</div>
                              </div>
                              <div style={{ background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                                <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b" }}>MY REMAINING</div>
                                <div style={{ fontSize: "1rem", fontWeight: 950, color: (selectedTask.targetQuantity - selectedTask.completedQuantity) > 0 ? "#ef4444" : "#16a34a" }}>{Math.max(0, selectedTask.targetQuantity - selectedTask.completedQuantity)}</div>
                              </div>
                              <div style={{ background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                                <div style={{ fontSize: "0.55rem", fontWeight: 800, color: "#64748b" }}>PERFORMANCE</div>
                                <div style={{ fontSize: "1rem", fontWeight: 950, color: "#7c3aed" }}>{completionPct}%</div>
                              </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "10px 14px", borderRadius: "14px", border: "1.5px solid #dbeafe", fontSize: "0.78rem" }}>
                              <span style={{ fontWeight: 800, color: "#64748b" }}>Countdown Timer:</span>
                              <span style={{ fontWeight: 900, color: countdownColor, display: "flex", alignItems: "center", gap: "4px" }}>
                                <LucideClock size={12} /> {countdownText.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {inspectorTab === "collaboration" && (
                    <>
                      {/* Comments Box */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          <LucideMessageSquare size={16} /> Comments & Notes ({comments.length})
                        </h4>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "180px", overflowY: "auto", padding: "6px", background: "#fafafa", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "10px" }}>
                          {comments.map((comment: any, idx: number) => (
                            <div key={idx} style={{ background: "white", padding: "8px 12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", marginBottom: "4px" }}>
                                <span style={{ color: "#2563eb" }}>{comment.author}</span>
                                <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: "0.8rem", color: "#334155", fontWeight: 500 }}>{comment.text}</p>
                            </div>
                          ))}
                          {comments.length === 0 && (
                            <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>
                              No comments posted yet.
                            </div>
                          )}
                        </div>

                        <form onSubmit={handlePostComment} style={{ display: "flex", gap: "8px" }}>
                          <input 
                            type="text" 
                            placeholder="Add updates or progress notes..." 
                            required
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.82rem", fontWeight: 600 }}
                          />
                          <button 
                            type="submit" 
                            disabled={isSubmittingComment}
                            style={{ border: "none", background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", color: "white", padding: "0 16px", borderRadius: "10px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "800" }}
                          >
                            {isSubmittingComment ? <LucideLoader2 size={14} className="animate-spin" /> : "Post"}
                          </button>
                        </form>
                      </div>

                      {/* Attachments Section */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          <LucidePaperclip size={16} /> Attachments / Files ({attachments.length})
                        </h4>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto", padding: "6px", background: "#fafafa", borderRadius: "12px", border: "1px solid #f1f5f9", marginBottom: "10px" }}>
                          {attachments.map((file: any, idx: number) => (
                            <a 
                              key={idx} 
                              href={file.url} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ background: "white", padding: "8px 12px", borderRadius: "10px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none" }}
                            >
                              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#1e3a8a" }}>{file.name}</span>
                              <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </a>
                          ))}
                          {attachments.length === 0 && (
                            <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>
                              No files attached.
                            </div>
                          )}
                        </div>

                        <form onSubmit={handlePostAttachment} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input 
                              type="text" 
                              placeholder="File Name (e.g. Resume)" 
                              required
                              value={attachmentName}
                              onChange={e => setAttachmentName(e.target.value)}
                              style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.78rem", background: "white" }}
                            />
                            <input 
                              type="text" 
                              placeholder="https://..." 
                              required
                              value={attachmentUrl}
                              onChange={e => setAttachmentUrl(e.target.value)}
                              style={{ flex: 1.5, padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.78rem", background: "white" }}
                            />
                          </div>
                          <button 
                            type="submit" 
                            disabled={isSubmittingAttachment}
                            style={{ border: "none", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", padding: "8px", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "800" }}
                          >
                            {isSubmittingAttachment ? <LucideLoader2 size={14} className="animate-spin" /> : "Attach File"}
                          </button>
                        </form>
                      </div>

                      {/* History Timeline */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: "0.85rem", fontWeight: "900", color: "#1e293b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          <LucideHistory size={16} /> Activity History Log
                        </h4>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", background: "#fafafa", borderRadius: "12px", border: "1px solid #f1f5f9", maxHeight: "150px", overflowY: "auto" }}>
                          {historyList.map((log: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start", position: "relative" }}>
                              {idx !== historyList.length - 1 && (
                                <div style={{ position: "absolute", left: "6px", top: "16px", bottom: "-12px", width: "2px", background: "#e2e8f0" }}></div>
                              )}
                              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#2563eb", border: "3px solid white", boxShadow: "0 0 4px rgba(0,0,0,0.1)", zIndex: 1, marginTop: "2px" }}></div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.72rem", color: "#1e293b", fontWeight: "700" }}>{log.text}</div>
                                <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: "800", marginTop: "2px" }}>
                                  By: {log.user} • {new Date(log.time).toLocaleDateString()} {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};

const safeParseArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const DetailItem = ({ label, value }: { label: string, value: any }) => (
  <div className="property-item">
    <span className="prop-label">{label}</span>
    <span className="prop-value">{value || "—"}</span>
  </div>
);

const SearchableSelect = ({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (v: string) => void, placeholder?: string }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => { setOpen(!open); setSearch(""); }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", background: "#fff", fontSize: "0.9rem", color: value ? "#0f172a" : "#64748b", userSelect: "none", minHeight: "42px" }}
      >
        <span>{value || placeholder || "Select"}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }}><path d="M1 3l5 5 5-5" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 10000, overflow: "hidden" }}>
          <div style={{ padding: "8px" }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px", color: "#94a3b8", textAlign: "center", fontSize: "0.85rem" }}>No results</div>
            ) : filtered.map((opt, i) => (
              <div
                key={i}
                onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                style={{ padding: "9px 14px", cursor: "pointer", fontSize: "0.88rem", color: opt === value ? "#2563eb" : "#0f172a", background: opt === value ? "#eff6ff" : "transparent", fontWeight: opt === value ? 600 : 400 }}
                onMouseEnter={e => { if (opt !== value) (e.target as HTMLElement).style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (opt !== value) (e.target as HTMLElement).style.background = "transparent"; }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const CRMView = ({ candidates, loading, selectedCandidate, setSelectedCandidate, onRefresh, type = "crm", currentUser }: any) => {
  const [viewState, setViewState] = useState<"list" | "form" | "profile">(selectedCandidate ? "profile" : "list");
  const [candidateFilter, setCandidateFilter] = useState<"today" | "all">(type === "my-data" ? "all" : "today");
  const [leadDataModal, setLeadDataModal] = useState<any>(null);
  const [leadDataForm, setLeadDataForm] = useState({ categories: [] as string[], remarks: "", customSearch: "" });
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const leadData = (() => {
    try {
      return JSON.parse(localStorage.getItem("givyansh_lead_data_v1") || "{}");
    } catch {
      return {};
    }
  })();
  const LEAD_CATEGORIES = {
    "Technology & IT": [
      "Software Development",
      "Web Development",
      "Mobile App Development",
      "Frontend Development",
      "Backend Development",
      "Full Stack Development",
      "Game Development",
      "AI / Machine Learning",
      "Data Science",
      "Data Analytics",
      "Cyber Security",
      "Cloud Computing",
      "DevOps",
      "Blockchain Development",
      "UI/UX Design",
      "QA / Testing",
      "System Administration",
      "Network Engineering",
      "Database Administration",
      "IT Support",
      "ERP / CRM Development",
      "Embedded Systems",
      "AR/VR Development",
      "IoT Development"
    ],
    "Business & Management": [
      "Business Development",
      "Operations Management",
      "Project Management",
      "Product Management",
      "Strategy & Planning",
      "Entrepreneurship",
      "General Management",
      "Administration",
      "Supply Chain Management",
      "Vendor Management",
      "Procurement / Purchasing",
      "Franchise Management"
    ],
    "Sales": [
      "Field Sales",
      "Inside Sales",
      "Retail Sales",
      "B2B Sales",
      "B2C Sales",
      "Telesales",
      "Channel Sales",
      "Corporate Sales",
      "Real Estate Sales",
      "Automobile Sales",
      "Insurance Sales",
      "Medical Representative",
      "Sales Management",
      "Enterprise Sales",
      "Direct Sales",
      "FMCG Sales",
      "SaaS Sales"
    ],
    "Marketing": [
      "Digital Marketing",
      "SEO",
      "SEM / PPC",
      "Social Media Marketing",
      "Content Marketing",
      "Influencer Marketing",
      "Brand Management",
      "Email Marketing",
      "Affiliate Marketing",
      "Performance Marketing",
      "Marketing Analytics",
      "Event Marketing",
      "PR / Public Relations",
      "Advertising",
      "Brand Marketing",
      "Product Marketing",
      "Growth Marketing"
    ],
    "Human Resources (HR)": [
      "Recruitment",
      "Talent Acquisition",
      "HR Generalist",
      "HR Operations",
      "Payroll",
      "Learning & Development",
      "Employee Engagement",
      "Compensation & Benefits",
      "HRBP",
      "Industrial Relations",
      "Training & Development",
      "Performance Management",
      "Compliance"
    ],
    "Finance & Accounting": [
      "Accounting",
      "Chartered Accountant (CA)",
      "Taxation",
      "Auditing",
      "Banking",
      "Investment Banking",
      "Financial Analysis",
      "Equity Research",
      "Risk Management",
      "Insurance",
      "Loan Processing",
      "Treasury",
      "Bookkeeping",
      "Accounts Payable",
      "Accounts Receivable",
      "GST Specialist"
    ],
    "Legal": [
      "Advocate / Lawyer",
      "Corporate Law",
      "Civil Law",
      "Criminal Law",
      "Legal Advisor",
      "Legal Research",
      "Compliance",
      "Intellectual Property",
      "Contract Management",
      "Legal Operations",
      "Litigation",
      "Arbitration"
    ],
    "Healthcare & Medical": [
      "Doctor",
      "Surgeon",
      "Dentist",
      "Nurse",
      "Pharmacist",
      "Physiotherapist",
      "Lab Technician",
      "Radiologist",
      "Medical Coding",
      "Medical Billing",
      "Healthcare Administration",
      "Veterinary",
      "Nutritionist",
      "Psychologist",
      "Therapist",
      "Medical Research",
      "Nursing",
      "Physiotherapy",
      "Radiology",
      "Dentistry",
      "Surgery",
      "Hospital Administration"
    ],
    "Education & Training": [
      "Teacher",
      "Professor",
      "Lecturer",
      "Tutor",
      "Online Instructor",
      "School Administration",
      "Academic Counselor",
      "Special Education",
      "Curriculum Developer",
      "Education Coordinator",
      "Teaching",
      "Corporate Trainer",
      "Education Counselor"
    ],
    "Engineering": [
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Electronics Engineering",
      "Chemical Engineering",
      "Aerospace Engineering",
      "Automobile Engineering",
      "Production Engineering",
      "Industrial Engineering",
      "Environmental Engineering",
      "Marine Engineering",
      "Mining Engineering",
      "Robotics Engineering",
      "Mechatronics",
      "Petroleum Engineering"
    ],
    "Construction & Real Estate": [
      "Architect",
      "Interior Designer",
      "Site Engineer",
      "Construction Manager",
      "Quantity Surveyor",
      "Real Estate Agent",
      "Property Consultant",
      "Urban Planning",
      "Facility Management"
    ],
    "Manufacturing & Production": [
      "Factory Worker",
      "Machine Operator",
      "Production Supervisor",
      "Quality Control",
      "CNC Operator",
      "Assembly Line",
      "Plant Management",
      "Lean Manufacturing"
    ],
    "Logistics & Supply Chain": [
      "Warehouse Management",
      "Logistics Coordinator",
      "Inventory Management",
      "Delivery Executive",
      "Fleet Management",
      "Transportation Management",
      "Import / Export"
    ],
    "Customer Service & Support": [
      "Customer Support",
      "Call Center",
      "Technical Support",
      "Chat Support",
      "Client Relations",
      "Customer Success"
    ],
    "Creative & Media": [
      "Graphic Design",
      "Video Editing",
      "Animation",
      "VFX",
      "Photography",
      "Cinematography",
      "Content Writing",
      "Copywriting",
      "Journalism",
      "News Reporting",
      "Script Writing",
      "Music Production",
      "Acting",
      "Voice Over Artist"
    ],
    "Hospitality & Tourism": [
      "Hotel Management",
      "Travel Consultant",
      "Cabin Crew",
      "Chef",
      "Restaurant Management",
      "Housekeeping",
      "Event Management",
      "Tourism Management"
    ],
    "Government & Public Sector": [
      "Civil Services",
      "Police",
      "Defence Services",
      "Railway Jobs",
      "PSU Jobs",
      "Government Clerk",
      "Public Administration",
      "Defence",
      "Railways"
    ],
    "Agriculture & Environment": [
      "Farming",
      "Agriculture Officer",
      "Horticulture",
      "Dairy Farming",
      "Fisheries",
      "Forestry",
      "Environmental Science",
      "Wildlife Conservation"
    ],
    "Science & Research": [
      "Research Scientist",
      "Biotechnologist",
      "Chemist",
      "Physicist",
      "Microbiologist",
      "Clinical Research",
      "Laboratory Research"
    ],
    "Media & Communication": [
      "Public Relations",
      "Broadcasting",
      "Radio Jockey",
      "TV Anchor",
      "Media Planning",
      "Corporate Communication"
    ],
    "Fashion & Beauty": [
      "Fashion Designer",
      "Makeup Artist",
      "Hair Stylist",
      "Beautician",
      "Nail Artist",
      "Personal Stylist",
      "Textile Designer"
    ],
    "Sports & Fitness": [
      "Athlete",
      "Coach",
      "Gym Trainer",
      "Yoga Instructor",
      "Sports Management",
      "Nutrition Coach",
      "Physical Trainer",
      "Trainer",
      "Gym Instructor"
    ],
    "Security Services": [
      "Security Guard",
      "Cyber Security Analyst",
      "Fire Safety Officer",
      "Surveillance Operator"
    ],
    "Freelance & Remote": [
      "Freelancer",
      "Virtual Assistant",
      "Remote Developer",
      "Remote Designer",
      "Remote Recruiter",
      "Online Consultant"
    ],
    "Blue Collar / Skilled Trades": [
      "Electrician",
      "Plumber",
      "Welder",
      "Carpenter",
      "Mechanic",
      "Driver",
      "Technician",
      "AC Technician",
      "Painter",
      "Tailor",
      "Mason"
    ],
    "Aviation & Maritime": [
      "Pilot",
      "Air Traffic Controller",
      "Aircraft Maintenance",
      "Merchant Navy",
      "Ship Captain",
      "Marine Technician"
    ],
    "E-commerce & Retail": [
      "Store Manager",
      "Cashier",
      "Merchandiser",
      "E-commerce Executive",
      "Amazon Flipkart Specialist",
      "Retail Operations"
    ],
    "Telecom": [
      "Telecom Engineer",
      "RF Engineer",
      "Network Technician",
      "Fiber Technician",
      "Network Engineer",
      "Telecom Operations"
    ],
    "BPO & KPO": [
      "Voice Process",
      "Non Voice Process",
      "International BPO",
      "Domestic BPO",
      "Knowledge Process Outsourcing"
    ],
    "Startup Ecosystem": [
      "Startup Founder",
      "Co-Founder",
      "Startup Operations",
      "Growth Hacker",
      "Venture Capital Analyst",
      "Incubation Manager",
      "Founder Office",
      "Entrepreneur"
    ],
    "Emerging & Modern Careers": [
      "Prompt Engineer",
      "AI Trainer",
      "Creator Economy Manager",
      "Influencer",
      "Streamer",
      "YouTuber",
      "Podcaster",
      "NFT Specialist",
      "Crypto Analyst",
      "Sustainability Consultant"
    ],
    "Employment Type": [
      "Full Time",
      "Part Time",
      "Internship",
      "Freelance",
      "Contract",
      "Temporary",
      "Remote",
      "Hybrid",
      "Work From Home",
      "Apprenticeship",
      "Volunteer",
      "Seasonal"
    ],
    "Experience Level": [
      "Fresher",
      "Entry Level",
      "Junior Level",
      "Mid Level",
      "Senior Level",
      "Lead Level",
      "Manager",
      "Director",
      "VP",
      "CXO"
    ],
    "Industry": [
      "IT Services",
      "SaaS",
      "Healthcare",
      "Education",
      "Banking",
      "FinTech",
      "EdTech",
      "Real Estate",
      "Automobile",
      "Manufacturing",
      "E-commerce",
      "Gaming",
      "Media",
      "Telecom",
      "Agriculture",
      "Government",
      "Logistics",
      "Hospitality",
      "Construction",
      "Pharmaceutical",
      "FMCG",
      "Retail",
      "Energy",
      "NGO",
      "Aviation",
      "Legal Services",
      "Consulting"
    ],
    "Information Technology (IT)": [
      "Software Development",
      "Web Development",
      "Mobile App Development",
      "Full Stack Development",
      "Frontend Development",
      "Backend Development",
      "DevOps",
      "Cloud Computing",
      "System Administration",
      "Network Administration",
      "Database Administration",
      "Cyber Security",
      "Ethical Hacking",
      "AI / Machine Learning",
      "Data Science",
      "Data Analytics",
      "Business Intelligence",
      "Blockchain",
      "AR/VR Development",
      "Game Development",
      "QA Testing",
      "Automation Testing",
      "Technical Support",
      "IT Helpdesk",
      "ERP Implementation",
      "CRM Administration"
    ],
    "Finance & Accounts": [
      "Accounting",
      "Taxation",
      "Auditing",
      "Financial Analysis",
      "Investment Banking",
      "Equity Research",
      "Treasury",
      "Risk Management",
      "Banking Operations",
      "Accounts Payable",
      "Accounts Receivable",
      "GST",
      "TDS"
    ],
    "Banking & Insurance": [
      "Retail Banking",
      "Corporate Banking",
      "Investment Banking",
      "Loan Processing",
      "Insurance Advisor",
      "Underwriting",
      "Claims Management",
      "Wealth Management"
    ],
    "Administration": [
      "Office Administration",
      "Executive Assistant",
      "Receptionist",
      "Facility Management",
      "Front Office"
    ],
    "Customer Support": [
      "Customer Service",
      "Customer Success",
      "Technical Support",
      "Voice Process",
      "Non Voice Process",
      "Chat Support",
      "Email Support",
      "International BPO"
    ],
    "Operations": [
      "Business Operations",
      "Process Management",
      "Vendor Management",
      "Program Management",
      "Project Coordination"
    ],
    "Project Management": [
      "Agile Management",
      "Scrum Master",
      "Product Owner",
      "PMO",
      "Program Manager"
    ],
    "Product Management": [
      "Product Manager",
      "Associate Product Manager",
      "Technical Product Manager",
      "Growth Product Manager"
    ],
    "Design & Creative": [
      "Graphic Design",
      "UI Design",
      "UX Design",
      "UI/UX Design",
      "Product Design",
      "Motion Graphics",
      "Animation",
      "Video Editing",
      "VFX",
      "3D Design",
      "Interior Design",
      "Fashion Design"
    ],
    "Content & Media": [
      "Content Writing",
      "Copywriting",
      "Technical Writing",
      "Journalism",
      "Editing",
      "Translation",
      "Script Writing",
      "Blogging"
    ],
    "Pharmaceutical": [
      "Drug Research",
      "Clinical Research",
      "Regulatory Affairs",
      "Quality Assurance",
      "Production"
    ],
    "Biotechnology": [
      "Genetics",
      "Bioinformatics",
      "Molecular Biology",
      "Microbiology"
    ],
    "Agriculture": [
      "Farming",
      "Agronomy",
      "Horticulture",
      "Dairy Farming",
      "Fisheries",
      "Poultry Farming"
    ],
    "Manufacturing": [
      "Production",
      "Assembly",
      "CNC Operator",
      "Plant Operations",
      "Factory Management"
    ],
    "Supply Chain & Logistics": [
      "Procurement",
      "Purchase",
      "Inventory",
      "Warehouse",
      "Logistics",
      "Transportation",
      "Export Import"
    ],
    "E-commerce": [
      "Marketplace Operations",
      "Catalog Management",
      "Seller Management",
      "Ecommerce Marketing"
    ],
    "Retail": [
      "Store Operations",
      "Merchandising",
      "Cashier",
      "Store Manager"
    ],
    "Real Estate": [
      "Property Consultant",
      "Broker",
      "Leasing",
      "CRM Real Estate"
    ],
    "Construction": [
      "Site Engineer",
      "Architect",
      "Quantity Surveyor",
      "Project Engineer"
    ],
    "Hospitality": [
      "Hotel Management",
      "Restaurant Management",
      "Chef",
      "Bartender",
      "Housekeeping",
      "Guest Relations"
    ],
    "Travel & Tourism": [
      "Travel Consultant",
      "Tour Operator",
      "Ticketing",
      "Visa Processing"
    ],
    "Aviation": [
      "Pilot",
      "Cabin Crew",
      "Ground Staff",
      "Aircraft Maintenance"
    ],
    "Maritime & Shipping": [
      "Seafarer",
      "Port Operations",
      "Ship Management"
    ],
    "Defence & Security": [
      "Army",
      "Navy",
      "Air Force",
      "Security Officer",
      "Fire Safety"
    ],
    "NGO & Social Work": [
      "Community Development",
      "CSR",
      "Social Worker"
    ],
    "Research & Development": [
      "Scientific Research",
      "Industrial Research",
      "Innovation"
    ],
    "Environment & Sustainability": [
      "Environmental Engineering",
      "ESG",
      "Sustainability"
    ],
    "Energy & Utilities": [
      "Solar Energy",
      "Wind Energy",
      "Power Plant",
      "Renewable Energy"
    ],
    "Media & Entertainment": [
      "Film Production",
      "Acting",
      "Direction",
      "Music",
      "Radio",
      "Television"
    ],
    "Beauty & Wellness": [
      "Beautician",
      "Makeup Artist",
      "Spa Therapist",
      "Hair Stylist"
    ],
    "Freelancing & Gig Economy": [
      "Freelancer",
      "Consultant",
      "Virtual Assistant"
    ],
    "Data & Analytics": [
      "Data Engineer",
      "Data Scientist",
      "Business Analyst",
      "MIS Executive"
    ],
    "Artificial Intelligence": [
      "Prompt Engineer",
      "LLM Engineer",
      "AI Researcher",
      "NLP Engineer",
      "Computer Vision Engineer"
    ],
    "Cyber Security": [
      "SOC Analyst",
      "Security Engineer",
      "Penetration Tester",
      "GRC Analyst"
    ],
    "Semiconductor & Electronics": [
      "VLSI",
      "Embedded Systems",
      "PCB Design",
      "Firmware Development"
    ],
    "Mining & Metals": [
      "Geologist",
      "Mining Engineer",
      "Metallurgy"
    ],
    "Textile & Apparel": [
      "Garment Production",
      "Textile Design",
      "Merchandising"
    ],
    "Luxury & Lifestyle": [
      "Luxury Retail",
      "Personal Styling"
    ],
    "Miscellaneous": [
      "Internship",
      "Apprenticeship",
      "Part Time Jobs",
      "Full Time Jobs",
      "Remote Jobs",
      "Work From Home",
      "Contract Jobs",
      "Temporary Jobs",
      "Volunteer Jobs",
      "Telecalling & Call Center",
      "Telecaller",
      "Telecalling Executive",
      "Telesales Executive",
      "Telemarketing Executive",
      "Customer Care Executive",
      "Customer Support Executive",
      "Call Center Executive",
      "BPO Executive",
      "Voice Process Executive",
      "Non-Voice Process Executive",
      "Chat Support Executive",
      "Email Support Executive",
      "Collection Executive",
      "Recovery Executive",
      "Verification Executive",
      "Lead Generation Executive",
      "Outbound Calling Executive",
      "Inbound Calling Executive",
      "International BPO Executive",
      "Domestic BPO Executive",
      "Customer Success Associate",
      "Reception & Front Desk",
      "Receptionist",
      "Front Desk Executive",
      "Guest Relations Executive",
      "Front Office Executive",
      "Clerical & Office Support",
      "Data Entry Operator",
      "Computer Operator",
      "Back Office Executive",
      "Office Assistant",
      "Office Coordinator",
      "Documentation Executive",
      "MIS Executive",
      "Delivery & Transportation",
      "Delivery Executive",
      "Courier Executive",
      "Driver",
      "Truck Driver",
      "Cab Driver",
      "Fleet Executive",
      "Skilled Trades",
      "Electrician",
      "Plumber",
      "Welder",
      "Fitter",
      "Carpenter",
      "Mechanic",
      "Technician",
      "Machine Operator",
      "Security Services",
      "Security Guard",
      "Security Supervisor",
      "CCTV Operator",
      "Bouncer",
      "Domestic Services",
      "Housekeeper",
      "Maid",
      "Cook",
      "Babysitter",
      "Caretaker",
      "Event Management",
      "Event Coordinator",
      "Event Manager",
      "Wedding Planner",
      "Event Host",
      "Printing & Publishing",
      "DTP Operator",
      "Printing Operator",
      "Publishing Executive",
      "Jewellery Industry",
      "Gold Appraiser",
      "Jewellery Designer",
      "Store Executive",
      "Warehouse & Logistics",
      "Picker",
      "Packer",
      "Loader",
      "Warehouse Associate",
      "Dispatch Executive",
      "Field Jobs",
      "Field Executive",
      "Field Sales Executive",
      "Survey Executive",
      "Collection Agent",
      "Recruitment Industry",
      "HR Recruiter",
      "IT Recruiter",
      "Non-IT Recruiter",
      "Staffing Specialist",
      "Talent Sourcer",
      "Digital Creator Economy",
      "YouTuber",
      "Content Creator",
      "Influencer",
      "Streamer",
      "Podcaster",
      "Religious & Community Services",
      "Priest",
      "Pandit",
      "Imam",
      "Community Worker",
      "Business & Management",
      "Business Development",
      "Strategy & Consulting",
      "General Management",
      "Operations Management",
      "Franchise Management",
      "Consulting",
      "Management Consulting",
      "IT Consulting",
      "Financial Consulting",
      "HR Consulting",
      "Legal Consulting",
      "Procurement & Sourcing",
      "Procurement",
      "Strategic Sourcing",
      "Vendor Development",
      "Purchase Management",
      "Auditing & Compliance",
      "Internal Audit",
      "Statutory Audit",
      "Risk & Compliance",
      "Governance",
      "Shared Services",
      "Global Capability Center (GCC)",
      "Captive Operations",
      "KPO & Knowledge Services",
      "KPO",
      "Research Analyst",
      "Market Research",
      "Competitive Intelligence",
      "Analytics",
      "Business Analytics",
      "Financial Analytics",
      "HR Analytics",
      "Marketing Analytics",
      "Product Analytics",
      "AI & Emerging Tech",
      "Generative AI",
      "Prompt Engineering",
      "Robotics Process Automation (RPA)",
      "Internet of Things (IoT)",
      "Quantum Computing",
      "Embedded & Hardware",
      "Embedded Systems",
      "Firmware Development",
      "Hardware Design",
      "Chip Design",
      "VLSI",
      "GIS & Mapping",
      "GIS Specialist",
      "Remote Sensing",
      "Geospatial Analytics",
      "Architecture & Planning",
      "Architecture",
      "Urban Planning",
      "Landscape Design",
      "Quality",
      "Quality Assurance",
      "Quality Control",
      "Six Sigma",
      "Lean Manufacturing",
      "Packaging",
      "Packaging Development",
      "Packaging Design",
      "Food Industry",
      "Food Technology",
      "Food Processing",
      "Bakery",
      "Beverage Production",
      "FMCG",
      "FMCG Sales",
      "FMCG Operations",
      "Distribution Management",
      "Dairy & Livestock",
      "Dairy Management",
      "Animal Husbandry",
      "Veterinary Services",
      "Fisheries & Aquaculture",
      "Fisheries",
      "Aquaculture",
      "Gems & Jewellery",
      "Jewellery Design",
      "Diamond Grading",
      "Gemology",
      "Leather Industry",
      "Leather Manufacturing",
      "Footwear Production",
      "Handicrafts & Artisans",
      "Handicrafts",
      "Pottery",
      "Handloom",
      "Artisan Work",
      "Printing & Media Production",
      "Printing Technology",
      "Pre-Press",
      "Publishing",
      "Animation & Gaming",
      "2D Animation",
      "3D Animation",
      "Game Art",
      "Game Design",
      "eSports",
      "Photography & Videography",
      "Photography",
      "Cinematography",
      "Videography",
      "Photo Editing",
      "Music & Performing Arts",
      "Singing",
      "Music Production",
      "Instrumentalist",
      "Dance",
      "Acting",
      "Theatre",
      "Linguistics & Language",
      "Translation",
      "Interpretation",
      "Localization",
      "Transcription",
      "Library & Documentation",
      "Librarian",
      "Archivist",
      "Records Management",
      "Aviation Support",
      "Air Ticketing",
      "Cargo Handling",
      "Airport Operations",
      "Railway Industry",
      "Railway Operations",
      "Track Maintenance",
      "Locomotive Services",
      "Ports & Logistics",
      "Port Management",
      "Shipping Operations",
      "Renewable Energy",
      "Solar Installation",
      "Wind Turbine Operations",
      "EV Infrastructure",
      "Electric Vehicles (EV)",
      "EV Technician",
      "Battery Technology",
      "Charging Infrastructure",
      "Smart Cities & Infrastructure",
      "Smart Infrastructure",
      "Urban Mobility",
      "Disaster Management",
      "Emergency Response",
      "Disaster Recovery",
      "Fire & Safety",
      "Fire Safety Officer",
      "HSE (Health Safety Environment)",
      "EHS",
      "Waste Management",
      "Recycling",
      "Solid Waste Management",
      "Water Management",
      "Water Treatment",
      "Wastewater Management",
      "Religion & Spiritual Services",
      "Astrology",
      "Vastu Consultant",
      "Spiritual Counselor",
      "Legal Enforcement",
      "Police Services",
      "Investigation",
      "Forensics",
      "Defence Manufacturing",
      "Defence Production",
      "Military Engineering",
      "Space & Astronomy",
      "Space Research",
      "Satellite Engineering",
      "Astronomy",
      "International Trade",
      "Export",
      "Import",
      "Customs Clearance",
      "Cryptocurrency & Web3",
      "Crypto Research",
      "Web3 Development",
      "Blockchain Consulting",
      "Creator Economy",
      "Influencer Marketing",
      "Creator Management",
      "Community Management",
      "Luxury Services",
      "Concierge Services",
      "Premium Customer Experience",
      "Household Services",
      "Cleaning Services",
      "Home Maintenance",
      "Appliance Repair",
      "Repair & Maintenance",
      "Mobile Repair",
      "Laptop Repair",
      "AC Technician",
      "Refrigerator Technician",
      "Unorganized Sector",
      "Helper",
      "Labour",
      "Daily Wage Worker",
      "Factory Worker",
      "Beauty & Personal Care",
      "Nail Artist",
      "Tattoo Artist",
      "Skin Specialist",
      "Fitness & Wellness",
      "Yoga Instructor",
      "Zumba Trainer",
      "Nutritionist",
      "Dietitian",
      "Senior Leadership",
      "CXO Office",
      "CEO Office",
      "Strategy Office",
      "Board Advisory",
      "Entrepreneurship",
      "Startup Founder",
      "Co-Founder",
      "Self Employed",
      "Independent Consultant",
      "Government Exams & Public Service",
      "UPSC",
      "SSC",
      "Banking Exams",
      "Teaching Exams",
      "Defence Exams",
      "Actuarial Science",
      "Auction Services",
      "Archaeology",
      "Anthropology",
      "Bakery & Confectionery",
      "Beverage Industry",
      "Brewing",
      "Cane & Sugar Industry",
      "Cement Industry",
      "Ceramics Industry",
      "Chemical Industry",
      "Petrochemical Industry",
      "Fertilizer Industry",
      "Paint Industry",
      "Plastic Industry",
      "Rubber Industry",
      "Glass Industry",
      "Paper Industry",
      "Pulp Industry",
      "Textile Industry",
      "Yarn Manufacturing",
      "Garment Manufacturing",
      "Apparel Industry",
      "Apparel Merchandising",
      "Toy Manufacturing",
      "Furniture Manufacturing",
      "Wood Industry",
      "Interior Decoration",
      "Modular Kitchen Design",
      "Home Automation",
      "Building Automation",
      "Smart Home Technology",
      "Semiconductor Industry",
      "Nanotechnology",
      "Material Science",
      "Nuclear Energy",
      "Atomic Research",
      "Meteorology",
      "Oceanography",
      "Hydrology",
      "Geology",
      "Geophysics",
      "Seismology",
      "Surveying",
      "Land Records",
      "Revenue Services",
      "Public Administration",
      "Diplomacy",
      "Foreign Services",
      "Embassy Operations",
      "International Relations",
      "Political Research",
      "Election Management",
      "Census Operations",
      "Statistics",
      "Econometrics",
      "Economics",
      "Behavioral Science",
      "Psychology",
      "Counseling",
      "Career Counseling",
      "Student Counseling",
      "Rehabilitation Services",
      "Special Education",
      "Child Development",
      "Elder Care Services",
      "Disability Support Services",
      "Speech Therapy",
      "Occupational Therapy",
      "Audiology",
      "Veterinary Science",
      "Zoology",
      "Botany",
      "Environmental Science",
      "Forestry",
      "Wildlife Conservation",
      "Marine Biology",
      "Dairy Technology",
      "Seed Technology",
      "Irrigation Management",
      "Sericulture",
      "Apiculture (Beekeeping)",
      "Floriculture",
      "Organic Farming",
      "Precision Agriculture",
      "AgriTech",
      "Drone Operations",
      "Drone Pilot",
      "UAV Operations",
      "Survey Drone Services",
      "E-learning",
      "Instructional Design",
      "EdTech",
      "Training & Development",
      "Coaching Institute",
      "Test Preparation",
      "Immigration Services",
      "Visa Consultancy",
      "Overseas Education",
      "Study Abroad Consulting",
      "Matrimonial Services",
      "Facility Services",
      "Housekeeping Services",
      "Laundry Services",
      "Pest Control",
      "Car Wash Services",
      "Fuel Station Operations",
      "Toll Operations",
      "Parking Management",
      "Club Management",
      "Casino Operations",
      "Theme Park Operations",
      "Entertainment Park Operations",
      "Museum Management",
      "Art Gallery Management",
      "Auction House Operations",
      "Event Production",
      "Celebrity Management",
      "Talent Management",
      "Artist Management",
      "Public Relations (PR)",
      "Corporate Communications",
      "Investor Relations",
      "Sustainability & ESG",
      "Corporate Social Responsibility (CSR)",
      "Knowledge Management",
      "Change Management",
      "Business Excellence",
      "Lean Management",
      "PMO",
      "Digital Transformation",
      "Innovation Management",
      "Startup Ecosystem",
      "Venture Capital",
      "Private Equity",
      "Hedge Funds",
      "Asset Management",
      "Wealth Management",
      "Family Office Management",
      "Franchise Development",
      "Channel Management",
      "Dealer Network Management",
      "Trade Marketing",
      "Merchandising",
      "Category Management",
      "Revenue Management",
      "Pricing Strategy",
      "Customer Experience (CX)",
      "User Experience (UX)",
      "Service Delivery",
      "Revenue Cycle Management",
      "Medical Billing",
      "Medical Transcription",
      "Clinical Data Management",
      "Pharmacovigilance",
      "Bioinformatics",
      "Genomics",
      "Proteomics",
      "Cell Biology",
      "Stem Cell Research",
      "Blue Collar / Ground Staff Categories (bahut important)",
      "Peon",
      "Office Boy",
      "Pantry Boy",
      "Housekeeping Staff",
      "Cleaner",
      "Janitor",
      "Gunman",
      "Gardener",
      "Personal Driver",
      "Delivery Boy",
      "Unloader",
      "Mason",
      "Painter",
      "Lift Technician",
      "CCTV Technician",
      "Gig Economy",
      "Uber Driver",
      "Ola Driver",
      "Rapido Captain",
      "Delivery Partner",
      "Freelancer",
      "Religious & Cultural",
      "Granthi",
      "Pujari",
      "Religious Teacher",
      "Household & Personal Services",
      "Chef",
      "Nanny",
      "Caregiver",
      "Personal Assistant",
      "Butler",
      "Home Tutor"
    ]
  };
  const flatCategories = [
    ...Object.entries(LEAD_CATEGORIES).flatMap(([group, cats]) => cats.map(c => `${group} > ${c}`)),
    "Other > Other (Specify Custom Category)"
  ];

  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [sourcingPlatforms, setSourcingPlatforms] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({
    sourcingDateFrom: "",
    sourcingDateTo: "",
    clientName: "",
    designation: "",
    state: "",
    gender: "",
    age: "",
    qualification: "",
    totalExperience: "",
    cvStatus: "",
    remarks: "",
    sourcingBy: "",
    vendorId: ""
  });
  const [formData, setFormData] = useState<any>({
    sourcingBy: "",
    sourcingDate: new Date().toISOString().split('T')[0],
    recruiterName: "firstattempt",
    reportingPerson: "Deepa Sidhnani",
    coldCalling: "Yes",
    clientName: "",
    designation: "",
    state: "",
    city: "",
    gender: "Male",
    candidateName: "",
    candidateNumber: "",
    email: "",
    dob: "",
    age: "",
    qualification: "",
    totalExperience: "",
    sector: "",
    currentOrg: "",
    currentCtc: "",
    expectedCtc: "",
    noticePeriod: "",
    cvStatus: "",
    offeredSalary: "",
    remarks: "",
    remarkReason: "",
    cvSharedWith: "",
    interviewDate: "",
    interviewType: "",
    interviewTime: "",
    vendorId: "",
    dataType: type === "leads" ? "lead" : "crm"
  });

  // Restore draft on mount / when currentUser loads
  useEffect(() => {
    if (!currentUser) return;
    const draftKey = `fast_rms_new_candidate_draft_${currentUser.id || 'default'}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (!parsed.id && !parsed._id) {
          setFormData(parsed);
          setViewState("form");
        }
      } catch (e) {
        console.error("Failed to restore draft:", e);
      }
    }
  }, [currentUser]);

  // Save draft on change
  useEffect(() => {
    if (!currentUser) return;
    const draftKey = `fast_rms_new_candidate_draft_${currentUser.id || 'default'}`;
    if (viewState === "form" && !formData.id && !formData._id) {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, viewState, currentUser]);

  useEffect(() => {
    // Persistent fetching for Filters & Form
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching clients:", err));

    fetch("/api/jobs")
      .then(res => res.json())
      .then(data => setJobs(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching jobs:", err));

    fetch("/api/sourcing/platforms")
      .then(res => res.json())
      .then(data => setSourcingPlatforms(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching sourcing platforms:", err));

    // Load vendors from localStorage moved to separate useEffect below

    if (viewState === "form") {
      fetch("/api/me")
        .then(res => res.json())
        .then(data => {
          setFormData((prev: any) => ({
            ...prev,
            recruiterName: data.name,
            reportingPerson: data.manager_tl?.name || "N/A",
            tlName: data.manager_tl?.name,
            managerName: data.manager_tl?.manager_tl?.name
          }));
        })
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [viewState, currentUser]);

  useEffect(() => {
    const loadVendors = async () => {
      let dbVendors: any[] = [];
      try {
        const res = await fetch("/api/vendors");
        if (res.ok) {
          const data = await res.json();
          dbVendors = data.map((v: any) => ({
            id: String(v.id),
            name: v.name,
            company: v.company,
            recruiterId: String(v.addedBy),
            recruiterName: v.creator?.name || currentUser?.name || "Recruiter"
          }));
        }
      } catch (err) {
        console.error("Error loading vendors from API:", err);
      }

      const key = `givyansh_vendors_v1_${currentUser?.id || currentUser?.role || 'recruiter'}`;
      const stored = localStorage.getItem(key);
      let localVendors: any[] = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localVendors = parsed.map((v: any) => ({
              id: String(v.id),
              name: v.name,
              company: v.company,
              recruiterId: String(v.recruiterId),
              recruiterName: v.recruiterName || "Recruiter"
            }));
          }
        } catch (e) {
          console.error(e);
        }
      }

      const merged = [...dbVendors];
      localVendors.forEach((lv) => {
        const alreadyInDb = dbVendors.some(
          (dv) => dv.name.toLowerCase() === lv.name.toLowerCase() && dv.company.toLowerCase() === lv.company.toLowerCase()
        );
        if (!alreadyInDb) {
          merged.push(lv);
        }
      });

      const allowed = merged.filter((v: any) => {
        if (currentUser?.role === "tl" || currentUser?.role === "manager" || currentUser?.role === "boss" || currentUser?.role === "superadmin") {
          return true;
        }
        return String(v.recruiterId) === String(currentUser?.id) || 
               v.recruiterName?.toLowerCase() === currentUser?.name?.toLowerCase();
      });

      setVendors(allowed);
    };

    loadVendors();
  }, [currentUser, viewState]);

  const handleDobChange = (e: any) => {
    const dob = e.target.value;
    let age = "";
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      age = (today.getFullYear() - birthDate.getFullYear()).toString();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age = (parseInt(age) - 1).toString();
      }
    }
    setFormData({ ...formData, dob, age });
  };

  const handlePhoneChange = (e: any) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, candidateNumber: value });
  };

  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dupPopup, setDupPopup] = useState<{ globalCount: number } | null>(null);
  const [limitPopup, setLimitPopup] = useState<{ phone: string; count: number } | null>(null);

  const noInterviewRemarks = ["not interested", "not connected"];
  const isNoInterviewRemark = noInterviewRemarks.includes((formData.remarks || "").toLowerCase());

  const mandatoryFields = [
    { key: "clientName", label: "Client Name" },
    { key: "designation", label: "Designation (Job Title)" },
    { key: "candidateName", label: "Candidate Name" },
    { key: "candidateNumber", label: "Candidate Number" },
    { key: "cvStatus", label: "Candidate CV Status" },
    { key: "remarks", label: "Remarks" },
    { key: "remarkReason", label: "Reason Of Remarks" },
    { key: "vendorId", label: "Vendor Referral" },
    { key: "sourcingBy", label: "Sourcing By" },
    // interviewDate is only mandatory when remarks is NOT "Not Interested" or "Not Connected", and interview type is not "Not Confirmed"
    ...(!isNoInterviewRemark && formData.interviewType !== "Not Confirmed" ? [{ key: "interviewDate", label: "Schedule Interview" }] : []),
    // interviewTime is mandatory when scheduling Today
    ...(!isNoInterviewRemark && formData.interviewType === "Today" ? [{ key: "interviewTime", label: "Select Interview Time" }] : []),
  ];


  const handleInterviewTypeChange = (type: string) => {
    let date = "";
    if (type === "Today") date = new Date().toISOString().split('T')[0];
    else if (type === "Tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    }

    setFormData((prev: any) => ({ ...prev, interviewType: type, interviewDate: date, interviewTime: (type === "Today") ? prev.interviewTime : "" }));
    setFormErrors((prev) => {
      const e = { ...prev };
      if (date || type === "Not Confirmed") delete e.interviewDate;
      if (type !== "Today") delete e.interviewTime;
      return e;
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };
      if (field === "clientName") {
        updated.designation = "";
      }
      return updated;
    });

    if (field === "interviewDate") {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      if (!value || value.trim() === "") {
        setFormErrors((prev) => ({ ...prev, interviewDate: "Please fill this block" }));
      } else if (value <= todayStr) {
        setFormErrors((prev) => ({
          ...prev,
          interviewDate: "please put tommarow or any other futrue day date not today and previous day date"
        }));
      } else {
        setFormErrors((prev) => {
          const e = { ...prev };
          delete e.interviewDate;
          return e;
        });
      }
    } else {
      if (value) setFormErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
    }
  };

  const doActualSave = async () => {
    setSaving(true);
    setDupPopup(null);
    try {
      const isEdit = formData.id || formData._id;
      const saveBody = {
        ...formData,
        name: formData.candidateName,
        phone: formData.candidateNumber,
        vendorId: formData.vendorId === "none" ? null : formData.vendorId
      };
      const res = await fetch(isEdit ? `/api/candidates/${isEdit}` : "/api/candidates", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveBody)
      });
      if (res.ok) {
        const savedCand = await res.json();
        const candId = savedCand?.candidate?.id || savedCand?.candidate?._id || savedCand.id || savedCand._id || formData.id || formData._id;
        if (candId) {
          const key = `givyansh_candidate_vendor_v1_${currentUser?.id || currentUser?.role || 'recruiter'}`;
          const mappings = JSON.parse(localStorage.getItem(key) || "{}");
          if (formData.vendorId && formData.vendorId !== "none") {
            mappings[candId] = formData.vendorId;
          } else {
            delete mappings[candId];
          }
          localStorage.setItem(key, JSON.stringify(mappings));
        }
        const draftKey = `fast_rms_new_candidate_draft_${currentUser?.id || 'default'}`;
        localStorage.removeItem(draftKey);
        onRefresh();
        window.dispatchEvent(new Event("REFRESH_GAMIFICATION"));
        setViewState("list");
        setFormErrors({});
      } else {
        const error = await res.json();
        alert("Failed to save: " + error.error);
      }
    } catch (err) {
      console.error(err);
      alert("System error during save.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveData = async () => {
    const errors: Record<string, string> = {};
    let firstErrorKey = "";
    for (const f of mandatoryFields) {
      if (!formData[f.key] || formData[f.key].toString().trim() === "") {
        errors[f.key] = "Please fill this block";
        if (!firstErrorKey) firstErrorKey = f.key;
      }
    }

    // Validate that interviewDate is a future date if interviewType is "Other Date"
    if (!isNoInterviewRemark && formData.interviewType === "Other Date" && formData.interviewDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      if (formData.interviewDate <= todayStr) {
        errors.interviewDate = "please put tommarow or any other futrue day date not today and previous day date";
        if (!firstErrorKey) firstErrorKey = "interviewDate";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Duplicate check (only for new registrations)
    const isEdit = formData.id || formData._id;
    if (!isEdit && formData.candidateNumber) {
      const phone = formData.candidateNumber.toString().trim();
      const myId = String(currentUser?.id || currentUser?.userId || "");

      // Global duplicate count
      const globalCount = candidates.filter((c: any) => {
        const cp = (c.candidateNumber || c.phone || "").toString().trim();
        return cp === phone;
      }).length;

      // Personal monthly limit (max 3 same number per recruiter per month)
      const now = new Date();
      const myMonthCount = candidates.filter((c: any) => {
        const cp = (c.candidateNumber || c.phone || "").toString().trim();
        if (cp !== phone) return false;
        const addedBy = String(c.createdBy || c.addedBy || c.recruiterId || "");
        if (addedBy !== myId) return false;
        const d = new Date(c.createdAt || c.sourcingDate || c.date || 0);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      if (myMonthCount >= 3) {
        setLimitPopup({ phone, count: myMonthCount });
        return;
      }

      if (globalCount > 0) {
        setDupPopup({ globalCount });
        return;
      }
    }

    await doActualSave();
  };

  if (viewState === "form") {
    return (
      <>
      <div className="full-mode-panel">
        <div className="registration-form-container" style={{ padding: "2rem 2.5rem" }}>
          <div className="form-header flex-between mb-large">
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900 }}>
                {formData.id || formData._id ? (
                  <>
                    <span style={{ color: "#0f172a" }}>EDIT </span>
                    <span style={{ color: "#2563eb" }}>CANDIDATE</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: "#0f172a" }}>NEW CANDIDATE </span>
                    <span style={{ color: "#2563eb" }}>REGISTRATION</span>
                  </>
                )}
              </h2>
              <p style={{ color: "#64748b" }}>{formData.id || formData._id ? "Update details for the existing talent prospect." : "Enter metrics for the new talent prospect."}</p>
            </div>
            <button className="btn-secondary glass" onClick={() => {
              setViewState("list");
              const draftKey = `fast_rms_new_candidate_draft_${currentUser?.id || 'default'}`;
              localStorage.removeItem(draftKey);
            }}>Cancel & Return</button>
          </div>
          <div className="form-grid-3">
            <div className="input-group"><label>Sourcing Date</label><input type="date" value={formData.sourcingDate} readOnly style={{ background: "#f8fafc", cursor: "not-allowed" }} /></div>
            <div className="input-group"><label>Recruiter Name</label><input type="text" value={formData.recruiterName} readOnly style={{ background: "#f8fafc", cursor: "not-allowed" }} /></div>
            <div className="input-group"><label>Reporting Person</label><input type="text" value={formData.reportingPerson} readOnly style={{ background: "#f8fafc", cursor: "not-allowed" }} /></div>
            <div className="input-group" id="field-clientName">
              <label>Client Name <span style={{ color: "#ef4444" }}>*</span></label>
              <SearchableSelect options={clients.filter((c: any) => !c.isHold || c.name === formData.clientName).map((c: any) => c.name)} value={formData.clientName} onChange={v => handleFieldChange("clientName", v)} placeholder="Select Client" />
              {formErrors.clientName && <span className="field-error">{formErrors.clientName}</span>}
            </div>
            <div className="input-group" id="field-designation">
              <label>Designation (Job Title) <span style={{ color: "#ef4444" }}>*</span></label>
              <SearchableSelect 
                options={jobs
                  .filter((j: any) => {
                    if (j.isHold && j.title !== formData.designation) return false;
                    if (!formData.clientName) return true;
                    return j.client?.name?.trim().toLowerCase() === formData.clientName?.trim().toLowerCase();
                  })
                  .map((j: any) => j.title + (j.client?.name ? ` - ${j.client.name}` : ""))
                } 
                value={formData.designation} 
                onChange={v => handleFieldChange("designation", v.split(" - ")[0])} 
                placeholder="Select Job Title" 
              />
              {formErrors.designation && <span className="field-error">{formErrors.designation}</span>}
            </div>
            <div className="input-group">
              <label>State</label>
              <SearchableSelect options={["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"]} value={formData.state} onChange={v => handleFieldChange("state", v)} placeholder="Select State" />
            </div>
            <div className="input-group"><label>City</label><input type="text" placeholder="Enter City" value={formData.city} onChange={e => handleFieldChange("city", e.target.value)} /></div>
            <div className="input-group"><label>Gender</label><SearchableSelect options={["Male", "Female"]} value={formData.gender} onChange={v => handleFieldChange("gender", v)} placeholder="Select Gender" /></div>
            <div className="input-group" id="field-candidateName">
              <label>Candidate Name <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="text" placeholder="Full Name" value={formData.candidateName} onChange={e => handleFieldChange("candidateName", e.target.value)} />
              {formErrors.candidateName && <span className="field-error">{formErrors.candidateName}</span>}
            </div>
            <div className="input-group" id="field-candidateNumber">
              <label>Candidate Number <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="text" placeholder="10 Digit Number" value={formData.candidateNumber} onChange={e => { handlePhoneChange(e); if (e.target.value) setFormErrors(p => { const x = { ...p }; delete x.candidateNumber; return x; }); }} />
              {formErrors.candidateNumber && <span className="field-error">{formErrors.candidateNumber}</span>}
            </div>
            <div className="input-group"><label>Personal Mail Id</label><input type="email" placeholder="Email Address" value={formData.email} onChange={e => handleFieldChange("email", e.target.value)} /></div>
            <div className="input-group"><label>Date Of Birth</label><input type="date" value={formData.dob} onChange={handleDobChange} /></div>
            <div className="input-group"><label>Age</label><input type="number" placeholder="Age" value={formData.age} onChange={e => handleFieldChange("age", e.target.value)} /></div>
            <div className="input-group">
              <label>Qualification</label>
              <SearchableSelect options={["BA", "BSc", "BCom", "BBA", "BCA", "BTech / BE", "MBBS", "BDS", "BPharma", "LLB", "BEd", "MA", "MSc", "MCom", "MBA", "MCA", "MTech", "LLM", "MEd", "PhD", "CA", "CS", "CMA", "CFA", "Below 10th", "10th Pass", "12th Pass", "ITI", "Polytechnic Diploma", "Other Diploma", "Certificate Course", "Other"]} value={formData.qualification} onChange={v => handleFieldChange("qualification", v)} placeholder="Select Qualification" />
            </div>
            <div className="input-group">
              <label>Total Experience</label>
              <SearchableSelect options={["Fresher", "Internship", "0-6 Months", "1 Year", "2 Years", "3 Years", "4 Years", "5 Years", "6 Years", "7 Years", "8 Years", "9 Years", "10 Years", "10+ Years", "N/A"]} value={formData.totalExperience} onChange={v => handleFieldChange("totalExperience", v)} placeholder="Select Experience" />
            </div>
            <div className="input-group"><label>Sector</label><input type="text" value={formData.sector} onChange={e => handleFieldChange("sector", e.target.value)} /></div>
            <div className="input-group"><label>Current Org</label><input type="text" placeholder="Current Company" value={formData.currentOrg} onChange={e => handleFieldChange("currentOrg", e.target.value)} /></div>
            <div className="input-group"><label>Current CTC</label><input type="number" value={formData.currentCtc} onChange={e => handleFieldChange("currentCtc", e.target.value)} /></div>
            <div className="input-group"><label>Expected CTC</label><input type="number" value={formData.expectedCtc} onChange={e => handleFieldChange("expectedCtc", e.target.value)} /></div>
            <div className="input-group">
              <label>Notice Period</label>
              <SearchableSelect options={["Immediate", "15D", "30D", "45D", "60D", "90D", "N/A"]} value={formData.noticePeriod} onChange={v => handleFieldChange("noticePeriod", v)} placeholder="Select Notice Period" />
            </div>
            <div className="input-group" id="field-cvStatus">
              <label>Candidate CV Status <span style={{ color: "#ef4444" }}>*</span></label>
              <SearchableSelect options={["Shared", "Non Shared"]} value={formData.cvStatus} onChange={v => handleFieldChange("cvStatus", v)} placeholder="Select CV Status" />
              {formErrors.cvStatus && <span className="field-error">{formErrors.cvStatus}</span>}
            </div>
            <div className="input-group"><label>Offered Salary</label><input type="number" value={formData.offeredSalary} onChange={e => handleFieldChange("offeredSalary", e.target.value)} /></div>
            <div className="input-group" id="field-remarks">
              <label>Remarks <span style={{ color: "#ef4444" }}>*</span></label>
              <SearchableSelect
                options={["Connected", "Interested", "Not Connected", "Not Interested"]}
                value={formData.remarks}
                onChange={v => {
                  handleFieldChange("remarks", v);
                  // If new remark is a no-interview type, clear the interview schedule
                  if (noInterviewRemarks.includes(v.toLowerCase())) {
                    setFormData((prev: any) => ({ ...prev, remarks: v, interviewDate: "", interviewType: "", interviewTime: "" }));
                    setFormErrors((prev) => { const e = { ...prev }; delete e.interviewDate; delete e.remarks; return e; });
                  }
                }}
                placeholder="Select Remark"
              />
              {formErrors.remarks && <span className="field-error">{formErrors.remarks}</span>}
            </div>

            {/* Schedule Interview — hidden for Not Interested / Not Connected */}
            {!isNoInterviewRemark && (
              <div className="input-group" id="field-interviewDate">
                <label style={{ fontWeight: 800 }}>Schedule Interview <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  <SearchableSelect
                    options={
                      (formData.remarks || "").toLowerCase() === "connected"
                        ? ["Today", "Tomorrow", "Other Date", "Not Confirmed"]
                        : ["Today", "Tomorrow", "Other Date"]
                    }
                    value={formData.interviewType}
                    onChange={handleInterviewTypeChange}
                    placeholder="Select Day"
                  />
                  {formData.interviewType === "Other Date" && (
                    <div className="animate-fade-in">
                      <input type="date" value={formData.interviewDate} onChange={e => handleFieldChange("interviewDate", e.target.value)} />
                    </div>
                  )}
                  {formData.interviewType === "Today" && (
                    <div id="field-interviewTime" className="animate-fade-in" style={{ padding: "10px", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                      <label style={{ fontSize: "0.8rem", color: "#0369a1", marginBottom: "4px", display: "block", fontWeight: 700 }}>Select Interview Time <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="time" value={formData.interviewTime} onChange={e => handleFieldChange("interviewTime", e.target.value)} style={{ borderColor: "#0ea5e9" }} />
                      {formErrors.interviewTime && <span className="field-error">{formErrors.interviewTime}</span>}
                    </div>
                  )}
                </div>
                {formErrors.interviewDate && <span className="field-error">{formErrors.interviewDate}</span>}
              </div>
            )}
            <div className="input-group" id="field-remarkReason">
              <label>Reason Of Remarks <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="text" placeholder="Type reason..." value={formData.remarkReason} onChange={e => handleFieldChange("remarkReason", e.target.value)} />
              {formErrors.remarkReason && <span className="field-error">{formErrors.remarkReason}</span>}
            </div>
            <div className="input-group">
              <label>Candidate CV Shared With</label>
              <SearchableSelect options={["Company Group", "ME", ...(formData.managerName ? [`${formData.managerName} (Manager)`] : []), ...(formData.tlName ? [`${formData.tlName} (TL)`] : []), "other", "N/A"]} value={formData.cvSharedWith} onChange={v => handleFieldChange("cvSharedWith", v)} placeholder="Select" />
            </div>
            <div className="input-group" id="field-vendorId">
              <label>Vendor Referral <span style={{ color: "#ef4444" }}>*</span></label>
              <SearchableSelect 
                options={[...vendors.map((v: any) => `${v.name} (${v.company})`), "None"]} 
                value={formData.vendorId ? (formData.vendorId === "none" ? "None" : (vendors.find((v: any) => String(v.id) === String(formData.vendorId)) ? `${vendors.find((v: any) => String(v.id) === String(formData.vendorId)).name} (${vendors.find((v: any) => String(v.id) === String(formData.vendorId)).company})` : "")) : ""} 
                onChange={(v) => {
                  if (v === "None") {
                    setFormData((prev: any) => ({ ...prev, vendorId: "none" }));
                  } else {
                    const found = vendors.find((vend: any) => `${vend.name} (${vend.company})` === v);
                    if (found) {
                      setFormData((prev: any) => ({ ...prev, vendorId: found.id }));
                    }
                  }
                }} 
                placeholder="Select Vendor Agency" 
              />
              {formErrors.vendorId && <span className="field-error">{formErrors.vendorId}</span>}
            </div>
            <div className="input-group" id="field-sourcingBy">
              <label>Sourcing By <span style={{ color: "#ef4444" }}>*</span></label>
              <SearchableSelect options={[...sourcingPlatforms.map((p: any) => p.name), "None"]} value={formData.sourcingBy} onChange={v => handleFieldChange("sourcingBy", v)} placeholder="Select Sourcing Platform" />
              {formErrors.sourcingBy && <span className="field-error">{formErrors.sourcingBy}</span>}
            </div>
          </div>
          <div className="form-footer mt-large">
            <button className="btn-primary" style={{ padding: "12px 60px", background: "#2563eb" }} onClick={handleSaveData} disabled={saving}>
              {saving ? "Saving Node..." : "Register Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Warning Popup */}
      {dupPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
          <div style={{ background: "#fff", borderRadius: "16px", border: "2px solid #f59e0b", padding: "24px 28px", width: "360px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "6px" }}>⚠️</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>Duplicate Candidate Detected</h3>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0 0 12px 0" }}>
              This candidate number has already been registered
            </p>
            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "10px", padding: "10px 14px", marginBottom: "18px" }}>
              <span style={{ fontSize: "0.72rem", color: "#92400e", fontWeight: 700, display: "block" }}>Global Duplicate Count</span>
              <span style={{ fontSize: "2rem", fontWeight: 900, color: "#d97706" }}>{dupPopup.globalCount}x</span>
              <span style={{ fontSize: "0.68rem", color: "#78350f", display: "block", marginTop: "2px" }}>times registered globally across all recruiters</span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
              onClick={() => { setDupPopup(null); }}
                style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", color: "#475569" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const errors: Record<string, string> = {};
                  let firstErrorKey = "";
                  for (const f of mandatoryFields) {
                    if (!formData[f.key] || formData[f.key].toString().trim() === "") {
                      errors[f.key] = "Please fill this block";
                      if (!firstErrorKey) firstErrorKey = f.key;
                    }
                  }
                  if (Object.keys(errors).length > 0) {
                    setFormErrors(errors);
                    setDupPopup(null);
                    const el = document.getElementById(`field-${firstErrorKey}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    alert("Please fill all mandatory fields before registering!");
                    return;
                  }
                  await doActualSave();
                }}
                disabled={saving}
                style={{ flex: 1, padding: "10px", border: "none", background: "#f59e0b", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", color: "#fff" }}
              >
                {saving ? "Saving..." : "Register Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Limit Popup */}
      {limitPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
          <div style={{ background: "#fff", borderRadius: "16px", border: "2px solid #ef4444", padding: "24px 28px", width: "360px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "6px" }}>🚫</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 12px 0" }}>This Candidate is already registered more than 3 times</h3>
            <button
              onClick={() => setLimitPopup(null)}
              style={{ width: "100%", padding: "10px", border: "none", background: "#ef4444", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", color: "#fff" }}
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}
      </>
    );
  }

  if (viewState === "profile" && selectedCandidate) {
    const sc = selectedCandidate;

    const getStatusBadge = (remarks: string) => {
      const r = (remarks || "").toLowerCase();
      if (r.includes("selected") || r.includes("joined")) return { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" };
      if (r.includes("rejected") || r.includes("not interested")) return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" };
      if (r.includes("joining")) return { bg: "#fef9c3", text: "#854d0e", border: "#fde68a" };
      if (r.includes("interview") || r.includes("shortlisted")) return { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" };
      return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
    };
    const badge = getStatusBadge(sc.remarks);

    const InfoCard = ({ title, icon, children }: any) => (
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1rem", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ color: "#2563eb" }}>{icon}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px" }}>{title}</span>
        </div>
        <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem 1.5rem" }}>
          {children}
        </div>
      </div>
    );

    const F = ({ label, value }: any) => (
      <div>
        <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "3px" }}>{label}</div>
        <div style={{ fontSize: "0.875rem", color: "#111827", fontWeight: 500 }}>{value || <span style={{ color: "#d1d5db" }}>—</span>}</div>
      </div>
    );

    return (
      <div style={{ height: "100%", overflowY: "auto", background: "#f8fafc" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", padding: "1.5rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
              Candidate Profile
            </div>
            <button
              onClick={() => setViewState("list")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.78rem" }}
            >
              ← Back to List
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 800, color: "#fff", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>
              {sc.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: "0 0 6px", color: "#fff", fontSize: "1.5rem", fontWeight: 800 }}>{sc.name}</h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                {sc.designation && (
                  <span style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.95)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                    {sc.designation}
                  </span>
                )}
                {sc.phone && (
                  <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 500 }}>
                    📞 {sc.phone}
                  </span>
                )}
                {sc.clientName && (
                  <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "2px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 500 }}>
                    🏢 {sc.clientName}
                  </span>
                )}
              </div>
            </div>
            {/* Status */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>Current Status</div>
              <div style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, padding: "5px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "0.82rem" }}>
                {sc.remarks || "New Prospect"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick info strip */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0.75rem 2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {[
            { label: "Experience", value: sc.totalExperience },
            { label: "Current CTC", value: sc.currentCtc ? `₹${sc.currentCtc}` : null },
            { label: "Expected CTC", value: sc.expectedCtc ? `₹${sc.expectedCtc}` : null },
            { label: "Notice Period", value: sc.noticePeriod },
            { label: "Sourcing Date", value: sc.sourcingDate },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: item.value ? "#1e3a8a" : "#d1d5db" }}>{item.value || "—"}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem 2rem" }}>

          <InfoCard title="Sourcing Information" icon={<LucideCalendar size={15} />}>
            <F label="Sourcing Date" value={sc.sourcingDate} />
            <F label="Recruiter Name" value={sc.recruiterName} />
            <F label="Reporting Person" value={sc.reportingPerson} />
            <F label="Cold Calling" value={sc.coldCalling} />
            <F label="Sourcing By" value={sc.sourcingBy} />
            <F label="Client Name" value={sc.clientName} />
          </InfoCard>

          <InfoCard title="Personal Information" icon={<LucideUsers size={15} />}>
            <F label="Candidate Name" value={sc.name} />
            <F label="Phone" value={sc.phone} />
            <F label="Email" value={sc.email} />
            <F label="Date of Birth" value={sc.dob} />
            <F label="Age" value={sc.age} />
            <F label="Gender" value={sc.gender} />
            <F label="State" value={sc.state} />
            <F label="City" value={sc.city} />
            <F label="Qualification" value={sc.qualification} />
          </InfoCard>

          <InfoCard title="Professional Details" icon={<LucideBriefcase size={15} />}>
            <F label="Designation" value={sc.designation} />
            <F label="Current Organisation" value={sc.currentOrg} />
            <F label="Total Experience" value={sc.totalExperience} />
            <F label="Sector" value={sc.sector} />
            <F label="Notice Period" value={sc.noticePeriod} />
          </InfoCard>

          <InfoCard title="Financial Details" icon={<LucideTrendingUp size={15} />}>
            <F label="Current CTC" value={sc.currentCtc ? `₹${sc.currentCtc}` : null} />
            <F label="Expected CTC" value={sc.expectedCtc ? `₹${sc.expectedCtc}` : null} />
            <F label="Offered Salary" value={sc.offeredSalary ? `₹${sc.offeredSalary}` : null} />
          </InfoCard>

          <InfoCard title="CV & Status" icon={<LucideAward size={15} />}>
            <F label="CV Status" value={sc.cvStatus} />
            <F label="CV Shared With" value={sc.cvSharedWith} />
            <F label="Remarks" value={sc.remarks} />
            <F label="Remark Reason" value={sc.remarkReason} />
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>Candidate CV</div>
              {sc.cvUrl ? (
                <a href={sc.cvUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#2563eb", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>
                  <LucideDownload size={13} /> Download CV
                </a>
              ) : <span style={{ fontSize: "0.82rem", color: "#d1d5db" }}>Not uploaded</span>}
            </div>
          </InfoCard>

          {/* Activity Timeline */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#2563eb" }}><LucideClock size={15} /></span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.7px" }}>Activity Timeline</span>
              {sc.InteractionNotes?.length > 0 && (
                <span style={{ marginLeft: "auto", background: "#eff6ff", color: "#2563eb", borderRadius: "20px", padding: "1px 9px", fontSize: "0.7rem", fontWeight: 700, border: "1px solid #bfdbfe" }}>
                  {sc.InteractionNotes.length}
                </span>
              )}
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              {(!sc.InteractionNotes || sc.InteractionNotes.length === 0) ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                  No activity logs found for this candidate.
                </div>
              ) : (
                <div>
                  {sc.InteractionNotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((note: any, idx: number, arr: any[]) => (
                    <div key={note.id} style={{ display: "flex", gap: "1rem" }}>
                      {/* Line + dot */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16px", flexShrink: 0 }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: idx === 0 ? "#2563eb" : "#e2e8f0", border: `2px solid ${idx === 0 ? "#93c5fd" : "#f1f5f9"}`, marginTop: "4px", flexShrink: 0 }} />
                        {idx !== arr.length - 1 && <div style={{ width: "1px", flex: 1, background: "#e2e8f0", margin: "3px 0", minHeight: "20px" }} />}
                      </div>
                      {/* Content */}
                      <div style={{ paddingBottom: "1rem", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "2px" }}>
                          <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.85rem" }}>{note.text}</div>
                          <div style={{ fontSize: "0.7rem", color: "#9ca3af", whiteSpace: "nowrap", fontWeight: 500 }}>
                            {new Date(note.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          by <span style={{ fontWeight: 600, color: "#374151" }}>{note.author?.name || "System"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const uniqueDesignations = Array.from(new Set(jobs.map((j: any) => j.title))).filter(Boolean).sort();

  // Lead vs CRM Segregation Logic
  const baseCandidates = candidates.filter((c: any) => {
    if (type === "leads") {
      // Only show specific personal leads
      const isMyLead = c.dataType === "lead" && (String(c.addedBy) === String(currentUser?.userId) || String(c.addedBy) === String(currentUser?.id));
      return isMyLead;
    } else if (type === "my-data") {
      // Only show CRM candidates added by me
      const isMine = (c.dataType === "crm" || !c.dataType) && 
        (String(c.addedBy) === String(currentUser?.id) || 
         String(c.addedBy) === String(currentUser?.userId) ||
         c.recruiterName?.toLowerCase() === currentUser?.name?.toLowerCase());
      return isMine;
    } else {
      // Only show CRM candidates
      const isCRM = c.dataType === "crm" || !c.dataType;
      if (!isCRM) return false;

      // Data segregation: Recruiters and TLs only see candidates they added
      if (currentUser?.role === "recruiter" || currentUser?.role === "tl") {
        return String(c.addedBy) === String(currentUser?.id) || 
               String(c.addedBy) === String(currentUser?.userId) ||
               c.recruiterName?.toLowerCase() === currentUser?.name?.toLowerCase();
      }
      return true;
    }
  });

  const filteredCandidates = baseCandidates.filter((c: any) => {
    // Phase 1: Temporal Filter
    if (candidateFilter === "today") {
      const sourcing = c.sourcingDate || c.createdAt || c.created_at || "";
      if (!String(sourcing).startsWith(todayStr)) return false;
    }

    // Phase 2: Neural Search Logic
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matches =
        (c.name || "").toLowerCase().includes(query) ||
        (c.phone || "").includes(query) ||
        (c.email || "").toLowerCase().includes(query) ||
        (c.jobRole || "").toLowerCase().includes(query) ||
        (c.designation || "").toLowerCase().includes(query);

      if (!matches) return false;
    }

    // Phase 3: Advanced Attributes Filtering
    const dateFrom = activeFilters.sourcingDateFrom;
    const dateTo = activeFilters.sourcingDateTo;
    if (dateFrom || dateTo) {
      const rawSourcing = c.sourcingDate || c.createdAt || c.created_at || "";
      const sourcingStr = rawSourcing.split('T')[0];
      if (sourcingStr) {
        if (dateFrom && sourcingStr < dateFrom) return false;
        if (dateTo && sourcingStr > dateTo) return false;
      } else {
        return false;
      }
    }

    for (const key in activeFilters) {
      if (key === "sourcingDateFrom" || key === "sourcingDateTo" || key === "sourcingDate") continue;
      if (activeFilters[key]) {
        const query = activeFilters[key].toLowerCase();
        let candidateVal = "";

        // Handle specific field mappings if necessary
        if (key === "designation") {
          candidateVal = (c.designation || c.jobRole || "").toLowerCase();
        } else if (key === "vendorId") {
          const suffix = currentUser?.id || currentUser?.role || 'recruiter';
          const mappings = JSON.parse(localStorage.getItem(`givyansh_candidate_vendor_v1_${suffix}`) || "{}");
          // Check DB vendorId first, then localStorage mapping
          const dbVendorId = (c.vendorId || "").toString();
          const localVendorId = (mappings[c.id || c._id] || "").toString();
          candidateVal = (dbVendorId || localVendorId).toLowerCase();
        } else {
          candidateVal = (c[key] || "").toString().toLowerCase();
        }

        if (key === "remarks" && query === "interview done") {
          const isInterviewDone = candidateVal.includes("interview done") || 
                                  candidateVal.includes("round") || 
                                  candidateVal.includes("processing") || 
                                  candidateVal.includes("all rounds done");
          if (!isInterviewDone) return false;
        } else {
          if (!candidateVal.includes(query)) return false;
        }
      }
    }

    return true;
  });

  const handleExportCSV = () => {
    // Neural Data Mapping Logic
    const headers = [
      "Sourcing Recruiter Name", "Reporting Person", "Date", "Cold Calling",
      "Client Name", "Designation (Job Title)", "State", "City",
      "Gender", "Candidate Name", "Candidate Number", "Personal Mail Id",
      "Date Of Birth", "Age", "Qualification", "Total Experience",
      "Sector", "Current Org", "Current CTC", "Expected CTC",
      "Notice Period", "Candidate CV Status", "Offered Salary",
      "Remarks", "Reason Of Remarks", "Candidate CV Shared With", "Sourcing By"
    ];

    const csvRows = filteredCandidates.map((c: any) => [
      c.recruiterName || "N/A",
      c.reportingPerson || "N/A",
      c.sourcingDate || "",
      c.coldCalling || "N/A",
      c.clientName || "N/A",
      c.designation || c.jobRole || "N/A",
      c.state || "N/A",
      c.city || "N/A",
      c.gender || "N/A",
      c.name,
      c.phone,
      c.email || "N/A",
      c.dob || "N/A",
      c.age || "N/A",
      c.qualification || "N/A",
      c.totalExperience || "N/A",
      c.sector || "N/A",
      c.currentOrg || "N/A",
      c.currentCtc || "0",
      c.expectedCtc || "0",
      c.noticePeriod || "N/A",
      c.cvStatus || "N/A",
      c.offeredSalary || "0",
      c.remarks || "N/A",
      c.remarkReason || "N/A",
      c.cvSharedWith || "N/A",
      c.sourcingBy || "N/A"
    ]);

    const csvString = [
      headers.join(","),
      ...csvRows.map((row: any) => row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Givyansh_CRM_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="full-pool-container">
        <div className="crm-dash-header" style={{ borderBottom: "1px solid #f1f5f9", flexShrink: 0, padding: "1.25rem 2rem 1.25rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", background: "white" }}>
           <div style={{ flexShrink: 0 }}>
               <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
                  {type === "leads" ? (
                    <span style={{ color: "#0f172a" }}>Lead Data</span>
                  ) : type === "my-data" ? (
                    <>
                      <span style={{ color: "#0f172a" }}>My Personal </span>
                      <span style={{ color: "#2563eb" }}>Data</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: "#0f172a" }}>Candi</span>
                      <span style={{ color: "#2563eb" }}>ates</span>
                    </>
                  )}
               </h1>
               <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>
                  {type === "leads" ? "Your personal strategic outreach" : type === "my-data" ? "Your complete lifetime candidate database" : "Strategic Recruitment Node"}
               </p>
           </div>

           {/* Middle Group: Search & View Toggle */}
           <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "300px" }}>
              <div className="search-bar-modern glass" style={{ flex: 1, maxWidth: "350px", background: "#f8fafc" }}>
                 <LucideSearch size={18} color="#94a3b8" />
                 <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              
              {type !== "leads" && type !== "my-data" && (
                 <div className="crm-toggle-switch" style={{ flexShrink: 0, padding: "4px", background: "#f1f5f9", borderRadius: "12px", display: "flex", gap: "4px" }}>
                   <button
                     onClick={() => setCandidateFilter("today")}
                     style={{ 
                       padding: "8px 20px", 
                       borderRadius: "10px", 
                       border: "none", 
                       fontSize: "0.85rem", 
                       fontWeight: 800, 
                       cursor: "pointer",
                       transition: "all 0.2s",
                       background: candidateFilter === "today" ? "#16a34a" : "transparent",
                       color: candidateFilter === "today" ? "white" : "#64748b",
                       boxShadow: candidateFilter === "today" ? "0 4px 12px rgba(22, 163, 74, 0.2)" : "none"
                     }}
                   >
                     Today
                   </button>
                   <button
                     onClick={() => setCandidateFilter("all")}
                     style={{ 
                       padding: "8px 20px", 
                       borderRadius: "10px", 
                       border: "none", 
                       fontSize: "0.85rem", 
                       fontWeight: 800, 
                       cursor: "pointer",
                       transition: "all 0.2s",
                       background: candidateFilter === "all" ? "#2563eb" : "transparent",
                       color: candidateFilter === "all" ? "white" : "#64748b",
                       boxShadow: candidateFilter === "all" ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none"
                     }}
                   >
                     All
                   </button>
                </div>
             )}
          </div>

          {/* Right Group: Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
             <button 
                onClick={() => setShowFilters(!showFilters)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid #e2e8f0", cursor: "pointer", background: showFilters ? "#16a34a" : "white", color: showFilters ? "white" : "#64748b", transition: "all 0.2s" }}
             >
                <LucideFilter size={16} /> Filters
             </button>
             
             <button
                onClick={() => window.dispatchEvent(new CustomEvent("START_TEST_POP"))}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid #e2e8f0", cursor: "pointer", background: "white", color: "#6366f1", transition: "all 0.2s" }}
             >
                Test Pop
             </button>

             <button
                onClick={() => window.dispatchEvent(new CustomEvent("TEST_BADGE_CELEBRATION"))}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid #e2e8f0", cursor: "pointer", background: "white", color: "#eab308", transition: "all 0.2s" }}
             >
                <LucideAward size={16} /> Test Animation
             </button>

             {type !== "my-data" && (
                <button 
                   className="btn-primary" 
                   onClick={() => {
                     setFormData({
                       sourcingBy: "",
                       sourcingDate: new Date().toISOString().split('T')[0],
                       recruiterName: currentUser?.name || "firstattempt",
                       reportingPerson: currentUser?.manager_tl?.name || "Deepa Sidhnani",
                       coldCalling: "Yes",
                       clientName: "",
                       designation: "",
                       state: "",
                       city: "",
                       gender: "Male",
                       candidateName: "",
                       candidateNumber: "",
                       email: "",
                       dob: "",
                       age: "",
                       qualification: "",
                       totalExperience: "",
                       sector: "",
                       currentOrg: "",
                       currentCtc: "",
                       expectedCtc: "",
                       noticePeriod: "",
                       cvStatus: "",
                       offeredSalary: "",
                       remarks: "",
                       remarkReason: "",
                       cvSharedWith: "",
                       interviewDate: "",
                       interviewType: "",
                       interviewTime: "",
                       vendorId: "", dataType: type === "leads" ? "lead" : "crm"
                     });
                     setSelectedCandidate(null);
                     setViewState("form");
                   }}
                   style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 800, background: "#2563eb", whiteSpace: "nowrap" }}
                >
                   <LucidePlus size={16} /> Register
                </button>
             )}
          </div>
           </div>

           {/* Advanced Filter Panel */}
           <AnimatePresence>
             {showFilters && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="advanced-filter-panel glass"
                 style={{ overflow: showFilters ? "visible" : "hidden", borderBottom: "1px solid #e2e8f0", background: "white", zIndex: 50, position: "relative" }}
               >
                  <div className="filter-inner-grid" style={{ padding: "1.5rem 2.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Sourcing Date From</label>
                        <input type="date" value={activeFilters.sourcingDateFrom} onChange={e => setActiveFilters({...activeFilters, sourcingDateFrom: e.target.value})} style={{ color: "#0f172a" }} />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Sourcing Date To</label>
                        <input type="date" value={activeFilters.sourcingDateTo} onChange={e => setActiveFilters({...activeFilters, sourcingDateTo: e.target.value})} style={{ color: "#0f172a" }} />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Client Name</label>
                        <SearchableSelect options={clients.map((cl: any) => cl.name)} value={activeFilters.clientName} onChange={v => setActiveFilters({...activeFilters, clientName: v})} placeholder="All Clients" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Designation</label>
                        <SearchableSelect options={uniqueDesignations as string[]} value={activeFilters.designation} onChange={v => setActiveFilters({...activeFilters, designation: v})} placeholder="All Designations" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>State</label>
                        <SearchableSelect options={["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"]} value={activeFilters.state} onChange={v => setActiveFilters({...activeFilters, state: v})} placeholder="All States" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Gender</label>
                        <SearchableSelect options={["Male","Female"]} value={activeFilters.gender} onChange={v => setActiveFilters({...activeFilters, gender: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Age</label>
                        <input type="number" placeholder="Enter Age" value={activeFilters.age} onChange={e => setActiveFilters({...activeFilters, age: e.target.value})} style={{ color: "#0f172a" }} />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Qualification</label>
                        <SearchableSelect options={["BA","BSc","BCom","BBA","BCA","BTech / BE","MBBS","BDS","BPharma","LLB","BEd","MA","MSc","MCom","MBA","MCA","MTech","LLM","MEd","PhD","CA","CS","CMA","CFA","Below 10th","10th Pass","12th Pass","ITI","Polytechnic Diploma","Other Diploma","Certificate Course","Other"]} value={activeFilters.qualification} onChange={v => setActiveFilters({...activeFilters, qualification: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Total Experience</label>
                        <SearchableSelect options={["Fresher","Internship","0-6 Months","1 Year","2 Years","3 Years","4 Years","5 Years","6 Years","7 Years","8 Years","9 Years","10 Years","10+ Years","N/A"]} value={activeFilters.totalExperience} onChange={v => setActiveFilters({...activeFilters, totalExperience: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>CV Status</label>
                        <SearchableSelect options={["Shared","Non Shared"]} value={activeFilters.cvStatus} onChange={v => setActiveFilters({...activeFilters, cvStatus: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Remarks</label>
                        <SearchableSelect options={["Connected","Interested","Not Connected","Not Interested","Joined","Dropped","Selected","Process for joining","Rejected","Interview Done","Interview Not Done","Round 1 Done","Round 2 Done","Round 3 Done","Round 4 Done","Round 5 Done","Processing For Next Round","All Rounds Done"]} value={activeFilters.remarks} onChange={v => setActiveFilters({...activeFilters, remarks: v})} placeholder="All" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Sourcing By</label>
                        <SearchableSelect options={sourcingPlatforms.map((p: any) => p.name)} value={activeFilters.sourcingBy} onChange={v => setActiveFilters({...activeFilters, sourcingBy: v})} placeholder="All Platforms" />
                     </div>
                     <div className="filter-group">
                        <label style={{ color: "#475569", fontWeight: 600 }}>Vendor Referral</label>
                        <SearchableSelect 
                           options={vendors.map((v: any) => `${v.name} (${v.company})`)} 
                           value={activeFilters.vendorId ? (vendors.find((v: any) => String(v.id) === String(activeFilters.vendorId)) ? `${vendors.find((v: any) => String(v.id) === String(activeFilters.vendorId)).name} (${vendors.find((v: any) => String(v.id) === String(activeFilters.vendorId)).company})` : "") : ""} 
                           onChange={v => {
                             const found = vendors.find((vend: any) => `${vend.name} (${vend.company})` === v);
                             setActiveFilters({ ...activeFilters, vendorId: found ? found.id : "" });
                           }} 
                           placeholder="All Vendors" 
                        />
                     </div>
                     <div className="filter-group clear-filters-container">
                        <button className="btn-clear-minimal" onClick={() => setActiveFilters({ sourcingDateFrom:"",sourcingDateTo:"",clientName:"",designation:"",state:"",gender:"",age:"",qualification:"",totalExperience:"",cvStatus:"",remarks:"",sourcingBy:"",vendorId:"" })}>
                           Reset Filters
                        </button>
                     </div>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

        <div className="pool-scroll-area" style={{ padding: "1.5rem 2.5rem" }}>
          {loading ? (
            <div className="flex-center py-xlarge"><LucideLoader2 className="animate-spin" size={32} /></div>
          ) : filteredCandidates.length > 0 ? (
            <div className="candidates-list-container">
                <table className="crm-table-v3" style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none" }}>
                  <thead>
                     <tr>
                        <th>Candidate</th>
                        <th>Job Role</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Location</th>
                        <th>Sourcing</th>
                        <th>Current Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredCandidates.map((c: any, idx: number) => (
                       <tr 
                         key={c.id || c._id} 
                         className="candidate-row-v3"
                         style={{ background: idx % 2 === 0 ? "#f8fafc" : "#ffffff" }}
                       >
                          <td>
                             <div className="v3-avatar-small-flex">
                                <div className="v3-avatar-small">{c.name?.[0]}</div>
                                <strong>{c.name}</strong>
                             </div>
                          </td>
                          <td>{c.jobRole || "N/A"}</td>
                          <td>{c.phone}</td>
                          <td>{c.email || "N/A"}</td>
                          <td style={{ fontSize: "0.85rem", color: "#475569" }}>
                             {c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state || "N/A"}
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>
                             {c.sourcingBy || "N/A"}
                          </td>
                          <td>
                             <span className={`status-pill ${c.remarks?.toLowerCase().replace(" ", "-") || "new"}`}>
                                {c.remarks || "New"}
                             </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                             <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button 
                                   className="btn-profile-view" 
                                   onClick={() => { setSelectedCandidate(c); setViewState("profile"); }}
                                   title="View Profile"
                                >
                                   <LucideEye size={16} />
                                </button>
                                <button 
                                   className="btn-profile-view" 
                                   style={{ color: "#2563eb", background: "#eff6ff", borderColor: "#bfdbfe" }}
                                   onClick={() => {
                                      setSelectedCandidate(c);
                                      const key = `givyansh_candidate_vendor_v1_${currentUser?.id || currentUser?.role || 'recruiter'}`;
                                      const mappedVendorId = c.vendorId || (JSON.parse(localStorage.getItem(key) || "{}"))[c.id || c._id] || "none";
                                      setFormData({ ...formData, ...c, candidateName: c.name, candidateNumber: c.phone, vendorId: mappedVendorId });
                                      setViewState("form");
                                   }}
                                   title="Edit Candidate"
                                >
                                   <LucidePencil size={16} />
                                </button>
                                  {(() => {
                                     const existingLeadCandidate = candidates.find((cand: any) => {
                                        const isMoved = !!leadData[cand.id || cand._id];
                                        return isMoved && cand.phone === c.phone;
                                     });
                                     
                                     if (existingLeadCandidate) {
                                        return (
                                           <button 
                                              className="btn-profile-view" 
                                              style={{ color: "#16a34a", background: "#dcfce7", borderColor: "#bbf7d0", fontWeight: 700, fontSize: "0.9rem" }}
                                              onClick={() => {
                                                 setLeadDataModal(existingLeadCandidate);
                                                 const existingInfo = leadData[existingLeadCandidate.id || existingLeadCandidate._id];
                                                 
                                                 let hasCustom = false;
                                                 let customVal = "";
                                                 const initialCategories = (existingInfo?.categories || []).map((cat: string) => {
                                                    const found = flatCategories.find(fc => fc.split(" > ")[1] === cat);
                                                    if (found) return found;
                                                    hasCustom = true;
                                                    customVal = cat;
                                                    return "Other > Other (Specify Custom Category)";
                                                 });

                                                 setLeadDataForm({
                                                    categories: initialCategories,
                                                    remarks: existingInfo?.remarks || "",
                                                    customSearch: ""
                                                 });
                                                 setCustomCategoryInput(customVal);
                                              }}
                                              title="Edit Lead Data"
                                           >
                                              <LucideCheck size={16} />
                                           </button>
                                        );
                                     }

                                     return (
                                        <button 
                                           className="btn-profile-view" 
                                           style={{ color: "#7c3aed", background: "#f5f3ff", borderColor: "#ddd6fe", fontWeight: 700, fontSize: "0.9rem" }}
                                           onClick={() => {
                                              setLeadDataModal(c);
                                              setLeadDataForm({ categories: [], remarks: "", customSearch: "" });
                                              setCustomCategoryInput("");
                                           }}
                                           title="Move to Lead Data"
                                        >
                                           <LucideArrowRight size={16} />
                                        </button>
                                     );
                                  })()}
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
            </div>
          ) : (
            <div className="empty-state-v3 flex-center flex-column" style={{ padding: "4rem" }}>
               <LucideUsers size={100} color="rgba(37, 99, 235, 0.1)" />
               <h3 style={{ marginTop: "20px" }}>
                 {type === "my-data" 
                   ? (candidateFilter === "today" ? "No personal candidates added today" : "Your personal database is Empty")
                   : (candidateFilter === "today" ? "No candidates added today" : "Candidates list is Empty")}
               </h3>
               <p style={{ color: "#64748b" }}>
                 {type === "my-data" 
                   ? (candidateFilter === "today" ? "Switch to 'All' to see your lifetime added candidates." : "Go to CRM tab and register your first candidate.")
                   : (candidateFilter === "today" ? "Switch to 'All' to see all candidates or register a new one." : "Register your first candidate to start the sequence.")}
               </p>
               {type !== "my-data" && <button className="btn-primary glass mt-large" onClick={() => setViewState("form")}>Register Candidate</button>}
            </div>
          )}
       </div>
    </div>
    
      {leadDataModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: "white", width: "500px", borderRadius: "24px", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
             <div className="flex-between mb-large">
               <div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}>
                    <LucideDatabase size={24} color="#7c3aed" /> {!!leadData[leadDataModal.id || leadDataModal._id] ? "Edit Lead Data" : "Move to Lead Data"}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
                    {!!leadData[leadDataModal.id || leadDataModal._id] ? `Edit lead details for ${leadDataModal.name}.` : `Save ${leadDataModal.name} to future pipeline.`}
                  </p>
               </div>
               <button onClick={() => setLeadDataModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><LucideXCircle size={24} color="#94a3b8" /></button>
             </div>

             <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px" }}>
                <div>
                   <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Interested Field / Category *</label>
                   <div style={{ position: "relative" }}>
                      <LucideSearch size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "12px" }} />
                      <input 
                        type="text" 
                        placeholder="Search category (e.g. AI, React)..." 
                        value={leadDataForm.customSearch} 
                        onChange={e => setLeadDataForm({...leadDataForm, customSearch: e.target.value})}
                        style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
                      />
                   </div>
                   <div style={{ maxHeight: "150px", overflowY: "auto", marginTop: "8px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px", background: "#f8fafc" }}>
                      {flatCategories.filter(c => c.toLowerCase().includes(leadDataForm.customSearch.toLowerCase())).map(c => {
                         const isSel = leadDataForm.categories.includes(c);
                         return (
                           <div key={c} onClick={() => setLeadDataForm({...leadDataForm, categories: isSel ? leadDataForm.categories.filter(x => x !== c) : [...leadDataForm.categories, c]})} style={{ padding: "8px 12px", fontSize: "0.85rem", cursor: "pointer", borderRadius: "6px", background: isSel ? "#e0e7ff" : "transparent", color: isSel ? "#4f46e5" : "#334155", fontWeight: isSel ? 700 : 500 }}>
                              {c}
                           </div>
                         )
                      })}
                   </div>
                   {leadDataForm.categories.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                         {leadDataForm.categories.map(c => (
                           <span key={c} style={{ background: "#f5f3ff", color: "#7c3aed", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                                 {c === "Other > Other (Specify Custom Category)" ? (customCategoryInput ? `Other: ${customCategoryInput}` : "Other (Specify Custom Category)") : c.split(" > ")[1]} <LucideX size={12} style={{ cursor: "pointer" }} onClick={() => setLeadDataForm({...leadDataForm, categories: leadDataForm.categories.filter(x => x !== c)})} />
                           </span>
                         ))}
                      </div>
                    )}
                    {leadDataForm.categories.includes("Other > Other (Specify Custom Category)") && (
                      <div style={{ marginTop: "12px" }} className="animate-fade-in">
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Enter Custom Category *</label>
                        <input 
                          type="text" 
                          placeholder="Type custom category name..." 
                          value={customCategoryInput} 
                          onChange={e => setCustomCategoryInput(e.target.value)} 
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.85rem", color: "#0f172a" }} 
                        />
                      </div>
                    )}
                </div>

                <div>
                   <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Remarks / Notes *</label>
                   <textarea 
                      placeholder="e.g. Candidate interested in UI/UX jobs after completing course..."
                      value={leadDataForm.remarks}
                      onChange={e => setLeadDataForm({...leadDataForm, remarks: e.target.value})}
                      rows={4}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "none", outline: "none" }}
                   />
                </div>
             </div>

             <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setLeadDataModal(null)} className="btn-secondary" style={{ padding: "10px 20px" }}>Cancel</button>
                <button 
                  onClick={() => {
                     if(leadDataForm.categories.length === 0 || !leadDataForm.remarks) return alert("Please select at least one category and add remarks.");
                     if(leadDataForm.categories.includes("Other > Other (Specify Custom Category)") && !customCategoryInput.trim()) {
                        return alert("Please enter your custom category name.");
                     }
                     const candidateId = leadDataModal.id || leadDataModal._id;
                     const d = JSON.parse(localStorage.getItem("givyansh_lead_data_v1") || "{}");
                     const finalCategories = leadDataForm.categories.map(c => {
                        if (c === "Other > Other (Specify Custom Category)") {
                          return customCategoryInput.trim();
                        }
                        return c.split(" > ")[1];
                     }).filter(Boolean);
                     d[candidateId] = { categories: finalCategories, remarks: leadDataForm.remarks, movedAt: Date.now(), movedBy: currentUser?.name || "Recruiter" };
                     localStorage.setItem("givyansh_lead_data_v1", JSON.stringify(d));

                     // Award +2 points for lead creation
                     fetch("/api/gamification/action", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({
                         actionType: "lead_created",
                         details: "Created Lead Data profile",
                         points: 2,
                         uniqueKey: `lead_created_${candidateId}`
                       })
                     }).catch(err => console.error("Failed to award points for lead creation:", err));

                     setLeadDataModal(null);
                     // alert("Candidate successfully moved to Lead Data Pipeline!");
                  }} 
                  className="btn-primary" 
                  style={{ background: "#7c3aed", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <LucideDatabase size={16} /> {!!leadData[leadDataModal.id || leadDataModal._id] ? "Save Changes" : "Save to Pipeline"}
                </button>
             </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

// Deprecated in favor of the new modular UnifiedInbox component

const PlaceholderView = ({ title, icon, desc }: any) => (
  <div className="placeholder-view flex-center" style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden", padding: 0, scrollbarGutter: "stable" }}>
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="placeholder-inner text-center"
    >
      <div className="placeholder-icon glass flex-center" style={{ width: "100px", height: "100px", margin: "0 auto 20px", color: "#2563eb", borderRadius: "30px" }}>
        {icon}
      </div>
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>{title}</h1>
      <p style={{ color: "#64748b", maxWidth: "450px", margin: "0 auto", fontSize: "1.1rem" }}>{desc}</p>

      <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <button className="btn-primary glass">Initiate Protocol</button>
        <button className="btn-secondary glass">View Documentation</button>
      </div>
    </motion.div>
  </div>
);

const EmployeeShiftCard = ({ shift }: { shift: any }) => {
  if (!shift) return null;

  // Calculate Running Status
  const getStatusLabel = () => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = shift.startTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const [eh, em] = shift.endTime.split(":").map(Number);
    const endMins = eh * 60 + em;

    const isRunning = endMins < startMins 
      ? (currentMins >= startMins || currentMins <= endMins)
      : (currentMins >= startMins && currentMins <= endMins);

    return isRunning ? "Active (Running Now)" : "Inactive / Outside Window";
  };

  const getEarlyLoginTime = () => {
    const [sh, sm] = shift.startTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const buffer = shift.earlyLoginAllowed !== undefined ? shift.earlyLoginAllowed : 60;
    const targetMins = (startMins - buffer + 1440) % 1440;
    const h = Math.floor(targetMins / 60);
    const m = targetMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getLateLogOutTime = () => {
    const [eh, em] = shift.endTime.split(":").map(Number);
    const endMins = eh * 60 + em;
    const buffer = shift.postShiftAllowed !== undefined ? shift.postShiftAllowed : 120;
    const targetMins = (endMins + buffer) % 1440;
    const h = Math.floor(targetMins / 60);
    const m = targetMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card" style={{ 
      padding: "20px 24px", 
      borderRadius: "24px", 
      border: "1.5px solid #e0f2fe", 
      background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)", 
      boxShadow: "0 10px 25px -15px rgba(37,99,235,0.08)",
      position: "relative",
      width: "100%",
      boxSizing: "border-box"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <span style={{ fontSize: "0.65rem", background: "#dbeafe", color: "#2563eb", padding: "4px 8px", borderRadius: "6px", fontWeight: 800, textTransform: "uppercase" }}>Workforce Timing Allocation</span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 950, margin: "6px 0 2px", color: "#0f172a", letterSpacing: "-0.5px" }}>{shift.name}</h2>
          <span style={{ fontSize: "0.8rem", color: getStatusLabel().includes("Active") ? "#16a34a" : "#64748b", fontWeight: 700 }}>
             ● {getStatusLabel()}
          </span>
        </div>
        <div style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb", width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <LucideClock size={20} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
         <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>SHIFT HOUR WINDOW</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#1e293b", marginTop: "2px", display: "block" }}>{shift.startTime} - {shift.endTime}</span>
         </div>
         <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>LUNCH BREAK</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#0369a1", marginTop: "2px", display: "block" }}>{shift.lunchStartTime || "N/A"} - {shift.lunchEndTime || "N/A"}</span>
         </div>
         <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>ALLOWED LOGIN ENTRY</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#16a34a", marginTop: "2px", display: "block" }}>After {getEarlyLoginTime()}</span>
         </div>
         <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>FORCE AUTO-LOGOUT</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#ef4444", marginTop: "2px", display: "block" }}>At {getLateLogOutTime()}</span>
         </div>
      </div>
    </div>
  );
};
// touch to refresh imports

