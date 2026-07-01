import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LucideMic, LucideMicOff, LucideVideo, LucideVideoOff, 
  LucideMonitor, LucideMessageSquare, LucideUsers, LucideSettings,
  LucidePhoneOff, LucideSend, LucidePlus, LucideUserMinus, LucideCrown,
  LucideShield, LucideVolume2, LucideSparkles, LucideRadio, LucideMinimize, LucideMaximize
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SourcingHub from "./SourcingHub";
import AttendanceHub from "./AttendanceHub";
import MyToDoList from "./MyToDoList";
import Jobs from "./Jobs";
import TaskAssignment from "./TaskAssignment";

interface MeetingRoomProps {
  meetingId: string;
  currentUser: {
    id: number;
    name: string;
    role: string;
    email?: string;
    companyId: number;
  } | null;
  role: "superadmin" | "boss" | "manager" | "tl" | "recruiter";
  onLeave: () => void;
  isPip?: boolean;
  crmActiveTab?: string;
  isSharingCRM?: boolean;
}

function SimulatedVideo({ name, isSpeaking, isSelf = false }: { name: string; isSpeaking: boolean; isSelf?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle, #1e293b 0%, #0f172a 100%)",
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { height: 6px; }
          50% { height: 16px; }
        }
      `}</style>

      {/* Mesh Grid Pattern Background */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: 0.7,
          zIndex: 0
        }}
      />

      {/* Rotating Cybernetic Ring */}
      <div
        style={{
          position: "absolute",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border: "2px dashed rgba(99, 102, 241, 0.4)",
          animation: "spin 20s linear infinite",
          zIndex: 0
        }}
      />

      {/* Avatar Wrapper with Speak Indicator Pulsing */}
      <div
        style={{
          position: "relative",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: isSelf 
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
            : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "1.8rem",
          fontWeight: 900,
          boxShadow: isSpeaking 
            ? "0 0 25px rgba(99, 102, 241, 0.8)" 
            : "0 8px 16px rgba(0, 0, 0, 0.4)",
          zIndex: 1,
          border: isSpeaking ? "3px solid #6366f1" : "2px solid rgba(255,255,255,0.1)",
          transition: "box-shadow 0.3s ease, border 0.3s ease"
        }}
      >
        {name ? name[0].toUpperCase() : "U"}
      </div>

      {/* Audio Wave Visualizer Bars */}
      {isSpeaking && (
        <div style={{ display: "flex", gap: "3px", height: "18px", marginTop: "16px", zIndex: 1, alignItems: "flex-end" }}>
          <span style={{ display: "inline-block", width: "4px", height: "8px", background: "#6366f1", borderRadius: "2px", animation: "bounce 0.7s infinite 0.1s" }}></span>
          <span style={{ display: "inline-block", width: "4px", height: "16px", background: "#6366f1", borderRadius: "2px", animation: "bounce 0.7s infinite 0.2s" }}></span>
          <span style={{ display: "inline-block", width: "4px", height: "10px", background: "#6366f1", borderRadius: "2px", animation: "bounce 0.7s infinite 0.3s" }}></span>
          <span style={{ display: "inline-block", width: "4px", height: "14px", background: "#6366f1", borderRadius: "2px", animation: "bounce 0.7s infinite 0.4s" }}></span>
          <span style={{ display: "inline-block", width: "4px", height: "6px", background: "#6366f1", borderRadius: "2px", animation: "bounce 0.7s infinite 0.5s" }}></span>
        </div>
      )}

      {/* Floating Info Badges */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(16, 185, 129, 0.2)",
          border: "1px solid #10b981",
          color: "#10b981",
          fontSize: "0.6rem",
          fontWeight: 800,
          padding: "2px 8px",
          borderRadius: "10px",
          zIndex: 1,
          letterSpacing: "0.5px"
        }}
      >
        LIVE STREAM
      </div>
    </div>
  );
}

function useSpeakingDetector(stream: MediaStream | null, isMutedOrInactive: boolean, callback: (isSpeaking: boolean) => void) {
  useEffect(() => {
    if (!stream || isMutedOrInactive) {
      callback(false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0 || audioTracks[0].readyState === "ended") {
      callback(false);
      return;
    }

    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    let intervalId: any;

    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        callback(average > 8);
      };

      intervalId = setInterval(checkVolume, 200);
    } catch (e) {
      console.warn("Failed to initialize speaking detector:", e);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [stream, isMutedOrInactive]);
}

function RemoteStreamAnalyzer({ stream, userId, isMutedOrInactive, onChange }: { stream: MediaStream | null; userId: number; isMutedOrInactive: boolean; onChange: (userId: number, speaking: boolean) => void }) {
  useSpeakingDetector(stream, isMutedOrInactive, (speaking) => {
    onChange(userId, speaking);
  });
  return null;
}

export default function MeetingRoom({ meetingId, currentUser, role, onLeave, isPip = false, crmActiveTab, isSharingCRM = false }: MeetingRoomProps) {
  const [meeting, setMeeting] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"participants" | "chat">("participants");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatToast, setChatToast] = useState<{ senderName: string; message: string } | null>(null);
  const chatMessagesRef = useRef<any[]>([]);
  const isInitialLoadRef = useRef(true);
  const activeTabRef = useRef<"participants" | "chat">("participants");
  const [newMsg, setNewMsg] = useState("");

  // Sync activeTabRef whenever activeTab changes
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab === "chat") {
      setUnreadChatCount(0); // Clear unread dot when chat is opened
    }
  }, [activeTab]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sharedModule, setSharedModule] = useState<string>("");
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Measure container size for dynamic responsiveness
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // WebRTC multi-user peer mesh states and refs
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [userId: number]: MediaStream }>({});
  const [speakingStates, setSpeakingStates] = useState<{ [userId: number]: boolean }>({});
  const [isSelfSpeaking, setIsSelfSpeaking] = useState(false);

  const peersRef = useRef<{ [userId: number]: RTCPeerConnection }>({});
  const peerRejoinsRef = useRef<{ [userId: number]: number }>({});
  const audioElementsRef = useRef<{ [userId: number]: HTMLAudioElement }>({});

  useSpeakingDetector(localStream, isMuted, setIsSelfSpeaking);

  // Update all remote audio element volumes when local volume changes
  useEffect(() => {
    Object.keys(audioElementsRef.current).forEach(key => {
      const el = audioElementsRef.current[Number(key)];
      if (el) {
        el.volume = volume / 100;
      }
    });
  }, [volume]);

  useEffect(() => {
    if (isSharingCRM !== undefined) {
      if (isSharingCRM) {
        setIsScreenSharing(true);
      } else {
        const wasPresenterSelf = meeting && Number(meeting.presenterId) === Number(currentUser?.id);
        if (wasPresenterSelf || !meeting?.presenterId) {
          if (wasPresenterSelf && screenStreamRef.current !== null) {
            handleStopScreenShare();
          } else {
            setIsScreenSharing(false);
            // Turn camera back on if we were screensharing
            if (wasPresenterSelf) {
              setIsCameraOff(false);
              if (localStreamRef.current) {
                localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = true; });
              }
            }
          }
        }
      }
    }
  }, [isSharingCRM, meeting?.presenterId, currentUser]);

  useEffect(() => {
    if (crmActiveTab) {
      setSharedModule(crmActiveTab);
    }
  }, [crmActiveTab]);


  // States for enhanced functionalities
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isMuteAllActive, setIsMuteAllActive] = useState(false);
  const [webcamFailed, setWebcamFailed] = useState(false);

  // Local camera stream
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const setLocalVideoEl = useCallback((el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (el && localStreamRef.current) {
      if (el.srcObject !== localStreamRef.current) {
        el.srcObject = localStreamRef.current;
      }
    }
  }, []);

  // Kick modal state
  const [kickedParticipants, setKickedParticipants] = useState<number[]>([]);
  const [waitingRoomList, setWaitingRoomList] = useState<number[]>([]);

  // Real-time screenshare streams and refs
  const screenshareVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Sync screenshare video srcObject
  useEffect(() => {
    const el = screenshareVideoRef.current;
    if (!el) return;

    const isSelfPresenter = Number(meeting?.presenterId) === Number(currentUser?.id);
    if (isSelfPresenter) {
      if (screenStreamRef.current && el.srcObject !== screenStreamRef.current) {
        el.srcObject = screenStreamRef.current;
      }
    } else if (meeting?.presenterId) {
      const remoteStream = remoteStreams[Number(meeting.presenterId)];
      if (remoteStream && el.srcObject !== remoteStream) {
        el.srcObject = remoteStream;
      }
    } else {
      el.srcObject = null;
    }
  }, [isScreenSharing, meeting?.presenterId, currentUser?.id, remoteStreams]);

  const navigate = useNavigate();

  // Load meeting details
  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Boot user out if meeting status is ended / completed / cancelled
        if (data.meeting.status === "completed" || data.meeting.status === "cancelled") {
          stopCamera();
          localStorage.removeItem("is_sharing_crm");
          localStorage.removeItem("current_active_meeting_id");
          window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
          onLeave();
          return;
        }

        // Boot user out if they have been kicked
        const selfAtt = data.meeting.attendances?.find((a: any) => Number(a.userId) === Number(currentUser?.id));
        if (selfAtt && (selfAtt.status === 'kicked' || selfAtt.rejected)) {
          alert("You have been removed from the meeting by the host.");
          stopCamera();
          localStorage.removeItem("is_sharing_crm");
          localStorage.removeItem("current_active_meeting_id");
          window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
          onLeave();
          return;
        }

        setMeeting(data.meeting);

        // Sync invitedUsers based on active attendance
        if (data.meeting.attendances) {
          setInvitedUsers(prev => {
            const next = new Set(prev);
            let changed = false;
            data.meeting.attendances.forEach((a: any) => {
              const uId = Number(a.userId);
              const hasLeftOrRejected = a.leaveTime !== null || a.status === 'left_early' || a.status === 'completed' || a.rejected;
              if (hasLeftOrRejected && next.has(uId)) {
                next.delete(uId);
                changed = true;
              }
            });
            return changed ? next : prev;
          });
        }
        
        // Assemble live participants (including host and accepted users)
        const hostObj = data.meeting.host;
        const attendees = data.meeting.attendances?.filter((a: any) => {
          // Filter out absent, completed, left early, kicked, or rejected attendees
          const isKicked = a.status === 'kicked' || a.rejected;
          const hasLeft = a.leaveTime !== null || a.status === 'left_early' || a.status === 'completed';
          const isAbsent = a.status === 'absent';
          const hasJoined = a.joinTime !== null;
          return !isKicked && !hasLeft && !isAbsent && hasJoined;
        }).map((a: any) => {
          const userIdVal = Number(a.user?.id || a.userId);
          const isSelf = Number(userIdVal) === Number(currentUser?.id);
          const isSpk = isSelf ? isSelfSpeaking : !!speakingStates[userIdVal];

          return {
            ...a.user,
            attendanceStatus: a.status,
            attendanceId: a.id,
            isHost: Number(a.userId) === Number(data.meeting.hostId),
            micActive: !!a.micActive,
            camActive: !!a.cameraActive,
            screenshareActive: !!a.screenshareActive,
            handRaised: !!a.handRaised,
            mutedByHost: !!a.mutedByHost,
            videoDisabledByHost: !!a.videoDisabledByHost,
            isSpeaking: !!a.micActive && isSpk,
            joinTime: a.joinTime,
            rejoins: a.rejoins
          };
        }).filter((u: any) => u.id && !kickedParticipants.includes(u.id)) || [];

        // Ensure host is in list
        const list = [...attendees];
        if (!list.find(u => Number(u.id) === Number(data.meeting.hostId)) && hostObj) {
          const hostAtt = data.meeting.attendances?.find((a: any) => Number(a.userId) === Number(data.meeting.hostId));
          const isSpk = Number(hostObj.id) === Number(currentUser?.id) ? isSelfSpeaking : !!speakingStates[Number(hostObj.id)];

          list.push({
            ...hostObj,
            attendanceStatus: "joined",
            isHost: true,
            micActive: hostAtt ? !!hostAtt.micActive : true,
            camActive: hostAtt ? !!hostAtt.cameraActive : true,
            screenshareActive: hostAtt ? !!hostAtt.screenshareActive : false,
            handRaised: hostAtt ? !!hostAtt.handRaised : false,
            mutedByHost: hostAtt ? !!hostAtt.mutedByHost : false,
            videoDisabledByHost: hostAtt ? !!hostAtt.videoDisabledByHost : false,
            isSpeaking: hostAtt ? (!!hostAtt.micActive && isSpk) : false,
            joinTime: hostAtt ? hostAtt.joinTime : null,
            rejoins: hostAtt ? hostAtt.rejoins : 0
          });
        }

        // Apply local states for currentUser
        const finalParticipants = list.map(p => {
          const isSelf = Number(p.id) === Number(currentUser?.id);
          if (isSelf) {
            return {
              ...p,
              micActive: !isMuted,
              camActive: !isCameraOff,
              screenshareActive: isScreenSharing,
              isSpeaking: !isMuted && isSelfSpeaking
            };
          }
          const isSpk = !!speakingStates[Number(p.id)];
          return {
            ...p,
            isSpeaking: !!p.micActive && isSpk
          };
        });

        // Force local mute if host muted current user
        if (selfAtt && selfAtt.mutedByHost && !isMuted) {
          setIsMuted(true);
        }

        // Force local camera off if host disabled current user's video
        if (selfAtt && selfAtt.videoDisabledByHost && !isCameraOff) {
          setIsCameraOff(true);
          if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(t => {
              t.enabled = false;
            });
          }
        }

        // Check if hand raised status has updated for self
        if (selfAtt) {
          setIsHandRaised(!!selfAtt.handRaised);
        }

        // Track external presenter state
        const isPresenterSelf = Number(data.meeting.presenterId) === Number(currentUser?.id);
        const externalPresenterActive = data.meeting.presenterId && !isPresenterSelf;

        if (externalPresenterActive) {
          setIsScreenSharing(true);
          setSharedModule(data.meeting.sharedModule || "dashboard");
        } else if (!isPresenterSelf) {
          setIsScreenSharing(false);
          setSharedModule("");
        } else {
          // We are the presenter. Our local screensharing action drives this.
          // If we have stopped sharing locally (isSharingCRM is false), we sync state.
          if (!isSharingCRM) {
            setIsScreenSharing(false);
            setSharedModule("");
          }
        }

        // Check if all other participants are muted by host to sync MuteAll state
        const otherParticipants = finalParticipants.filter(p => Number(p.id) !== Number(currentUser?.id) && !p.isHost);
        if (otherParticipants.length > 0 && otherParticipants.every(p => p.mutedByHost)) {
          setIsMuteAllActive(true);
        } else {
          setIsMuteAllActive(false);
        }

        setParticipants(finalParticipants);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Chat fetch
  const fetchChats = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/chat`);
      if (res.ok) {
        const msgs = await res.json();
        if (msgs.length > chatMessagesRef.current.length) {
          const newMsgs = msgs.slice(chatMessagesRef.current.length);
          if (!isInitialLoadRef.current) {
            newMsgs.forEach((m: any) => {
              if (Number(m.senderId) !== Number(currentUser?.id)) {
                // Trigger a toast notification
                setChatToast({ senderName: m.senderName, message: m.message });
                setTimeout(() => {
                  setChatToast(prev => (prev?.senderName === m.senderName && prev?.message === m.message ? null : prev));
                }, 4000);
                // Increment unread count if not on chat tab
                if (activeTabRef.current !== "chat") {
                  setUnreadChatCount(prev => prev + 1);
                }
              }
            });
          }
        }
        setChatMessages(msgs);
        chatMessagesRef.current = msgs;
        isInitialLoadRef.current = false;
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDetails();
    fetchChats();

    // Reduced to 500ms for instant real-time latency
    const detailInterval = setInterval(fetchDetails, 500);
    // Reduced to 1000ms (was 1500ms)
    const chatInterval = setInterval(fetchChats, 1000);

    return () => {
      clearInterval(detailInterval);
      clearInterval(chatInterval);
    };
  }, [meetingId, kickedParticipants, isMuted, isCameraOff, isScreenSharing]);

  // Track whether we've acquired a media stream for WebRTC (even if camera is off, we still need audio)
  const webrtcReadyRef = useRef(false);

  // Initialize local media stream: always get audio; video is conditional
  // We never fully stop the stream — instead we enable/disable tracks to preserve WebRTC connections
  useEffect(() => {
    const initStream = async () => {
      try {
        // If we already have a stream, just toggle video tracks
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(t => {
            t.enabled = !isCameraOff;
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = isCameraOff ? null : localStreamRef.current;
          }
          setWebcamFailed(false);
          return;
        }

        // First time: request media
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: !isCameraOff,
            audio: true
          });
          setWebcamFailed(false);
        } catch (videoErr) {
          // Video access failed — try audio only so WebRTC still works
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          } catch (audioErr) {
            // No media at all — create a silent stream so WebRTC can still negotiate
            const ctx = new AudioContext();
            const dest = ctx.createMediaStreamDestination();
            stream = dest.stream;
          }
          setWebcamFailed(true);
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
        webrtcReadyRef.current = true;

        if (!isCameraOff && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Failed to initialize media stream:", err);
        setWebcamFailed(true);
      }
    };

    initStream();
  }, [isCameraOff]);

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      webrtcReadyRef.current = false;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  // WebRTC Multi-User Signaling & Connection Helpers
  const sendSignal = async (toUserId: number, signalData: any) => {
    try {
      await fetch(`/api/meetings/${meetingId}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: currentUser?.id, to: toUserId, data: signalData })
      });
    } catch (e) {
      console.error("Failed to send WebRTC signal:", e);
    }
  };

  // Buffer ICE candidates per peer until remote description is set
  const iceCandidateBuffers = useRef<{ [userId: number]: RTCIceCandidateInit[] }>({});

  const flushIceCandidates = async (pc: RTCPeerConnection, peerId: number) => {
    const buffered = iceCandidateBuffers.current[peerId] || [];
    for (const candidate of buffered) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("Buffered ICE candidate add failed:", e);
      }
    }
    iceCandidateBuffers.current[peerId] = [];
  };

  const createPeerConnection = (targetUserId: number) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        {
          urls: "turn:a.relay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject"
        },
        {
          urls: "turn:a.relay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject"
        },
        {
          urls: "turn:a.relay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject"
        }
      ]
    });

    // Add all local tracks (audio always; video enabled/disabled by track.enabled)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (track.kind === "video" && isScreenSharing && screenStreamRef.current) {
          const screenTrack = screenStreamRef.current.getVideoTracks()[0];
          if (screenTrack) {
            pc.addTrack(screenTrack, screenStreamRef.current);
            return;
          }
        }
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(targetUserId, { type: "candidate", candidate: event.candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE state with user ${targetUserId}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === "failed") {
        // Try ICE restart
        try { (pc as any).restartIce?.(); } catch (_) {}
      }
      if (pc.iceConnectionState === "closed") {
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[targetUserId];
          return next;
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with user ${targetUserId}:`, pc.connectionState);
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[targetUserId];
          return next;
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`[WebRTC] Got remote track from user ${targetUserId}`, event.track.kind);
      const stream = event.streams?.[0] || new MediaStream([event.track]);
      setRemoteStreams(prev => ({
        ...prev,
        [targetUserId]: stream
      }));
    };

    return pc;
  };

  const handleSignal = async (signal: any) => {
    const { from, data } = signal;
    let pc = peersRef.current[from];

    if (data.type === "offer") {
      if (pc) {
        pc.close();
        delete peersRef.current[from];
      }
      pc = createPeerConnection(from);
      peersRef.current[from] = pc;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        await flushIceCandidates(pc, from);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal(from, { type: "answer", sdp: answer });
      } catch (e) {
        console.error("[WebRTC] Error handling offer:", e);
      }
    } else if (data.type === "answer") {
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          await flushIceCandidates(pc, from);
        } catch (e) {
          console.error("[WebRTC] Error setting answer:", e);
        }
      }
    } else if (data.type === "candidate") {
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.warn("[WebRTC] Error adding ICE candidate:", e);
        }
      } else {
        // Buffer candidate until remote description is set
        if (!iceCandidateBuffers.current[from]) iceCandidateBuffers.current[from] = [];
        iceCandidateBuffers.current[from].push(data.candidate);
      }
    }
  };

  // Manage WebRTC connection lifecycles when participant list updates
  // No longer gates on localStream — uses webrtcReadyRef which is true once stream is available
  useEffect(() => {
    if (!currentUser || !localStream) return;

    const activePeers = participants.filter(p => Number(p.id) !== Number(currentUser.id));
    const activePeerIds = activePeers.map(p => Number(p.id));

    // Close connections for peers who left or whose connection has failed/closed/disconnected
    Object.keys(peersRef.current).forEach(key => {
      const pId = Number(key);
      const pc = peersRef.current[pId];
      const isFailed = pc && (pc.connectionState === "failed" || pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected");
      if (!activePeerIds.includes(pId) || isFailed) {
        console.log(`[WebRTC] Closing/recreating peer connection with ${pId} (reason: ${!activePeerIds.includes(pId) ? 'left' : 'failed/disconnected'})`);
        if (pc) {
          try { pc.close(); } catch (_) {}
          delete peersRef.current[pId];
        }
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[pId];
          return next;
        });
        setSpeakingStates(prev => {
          const next = { ...prev };
          delete next[pId];
          return next;
        });
      }
    });

    // Initiate connection to new peers
    activePeers.forEach(async (p) => {
      const pId = Number(p.id);

      // Detect if peer has refreshed or rejoined, close old connection to force fresh offer/answer
      const currentRejoins = p.rejoins || 0;
      const recordedRejoins = peerRejoinsRef.current[pId];
      const hasRejoined = recordedRejoins !== undefined && recordedRejoins !== currentRejoins;

      if (hasRejoined) {
        console.log(`[WebRTC] Peer ${pId} has refreshed/rejoined (rejoins: ${recordedRejoins} -> ${currentRejoins}). Reconnecting...`);
        const pc = peersRef.current[pId];
        if (pc) {
          try { pc.close(); } catch (_) {}
          delete peersRef.current[pId];
        }
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[pId];
          return next;
        });
      }

      // Record latest rejoins count
      peerRejoinsRef.current[pId] = currentRejoins;

      if (!peersRef.current[pId]) {
        // Higher user ID acts as signaling initiator (creates offer)
        if (Number(currentUser.id) > pId) {
          console.log(`[WebRTC] Creating offer to user ${pId}`);
          const pc = createPeerConnection(pId);
          peersRef.current[pId] = pc;
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal(pId, { type: "offer", sdp: offer });
          } catch (err) {
            console.error("[WebRTC] Failed to create offer:", err);
            pc.close();
            delete peersRef.current[pId];
          }
        }
        // Lower ID waits for offer — nothing to do here
      }
    });
  }, [participants, currentUser, localStream]);

  // Stable ref to always have latest handleSignal without restarting interval
  const handleSignalRef = useRef(handleSignal);
  useEffect(() => { handleSignalRef.current = handleSignal; }, [participants, localStream]);

  // Poll WebRTC signals from signaling server — starts as soon as we have a user, even before stream
  useEffect(() => {
    if (!currentUser) return;
    const pollSignals = async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/signals?userId=${currentUser.id}`);
        if (res.ok) {
          const signals = await res.json();
          for (const signal of signals) {
            await handleSignalRef.current(signal);
          }
        }
      } catch (e) {
        console.error("[WebRTC] Error polling signals:", e);
      }
    };

    const interval = setInterval(pollSignals, 500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[WebRTC] Tab became visible. Performing instant sync...");
        fetchDetails();
        pollSignals();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [meetingId, currentUser]);

  // Cleanup WebRTC connections on unmount
  useEffect(() => {
    return () => {
      Object.keys(peersRef.current).forEach(key => {
        const pId = Number(key);
        if (peersRef.current[pId]) {
          peersRef.current[pId].close();
        }
      });
      peersRef.current = {};
      iceCandidateBuffers.current = {};
    };
  }, []);

  // Play soft synthesized sound when others are speaking
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const someoneSpeaking = participants.some(p => Number(p.id) !== Number(currentUser?.id) && p.micActive && p.isSpeaking);

    if (someoneSpeaking) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(130 + Math.random() * 60, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.004 * (volume / 100), ctx.currentTime);
      
      const interval = setInterval(() => {
        osc.frequency.setValueAtTime(130 + Math.random() * 60, ctx.currentTime);
        gain.gain.setValueAtTime((0.002 + Math.random() * 0.003) * (volume / 100), ctx.currentTime);
      }, 200);

      osc.start();

      return () => {
        clearInterval(interval);
        try {
          osc.stop();
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch (e) {}
      };
    }
  }, [participants, volume, currentUser]);

  // Periodic Telemetry heartbeat — reduced to 3000ms for real-time mic/cam state sync
  useEffect(() => {
    const sendTelemetry = async () => {
      try {
        const localSharing = localStorage.getItem("is_sharing_crm") === "true";
        await fetch(`/api/meetings/${meetingId}/telemetry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            micActive: !isMuted,
            cameraActive: !isCameraOff,
            screenshareActive: localSharing,
            sharedModule: localSharing ? sharedModule : null,
            disconnected: false
          })
        });
      } catch (e) {}
    };

    // Send initial telemetry immediately on mount / state change
    sendTelemetry();

    const interval = setInterval(sendTelemetry, 1000);
    return () => clearInterval(interval);
  }, [meetingId, isMuted, isCameraOff, isSharingCRM, sharedModule]);

  // Auto-join meeting on mount to ensure server registers active/rejoined status immediately
  useEffect(() => {
    const performJoin = async () => {
      try {
        await fetch(`/api/meetings/${meetingId}/join`, { method: "POST" });
        fetchDetails();
      } catch (e) {
        console.error("Error auto-joining meeting:", e);
      }
    };
    performJoin();
  }, [meetingId]);

  // Exit trigger if user logs out or leaves page
  useEffect(() => {
    const checkLogout = () => {
      if (isScreenSharing) {
        setIsScreenSharing(false);
        setSharedModule("");
      }
    };
    window.addEventListener("beforeunload", checkLogout);
    return () => {
      window.removeEventListener("beforeunload", checkLogout);
    };
  }, [isScreenSharing]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      const res = await fetch(`/api/meetings/${meetingId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMsg })
      });
      if (res.ok) {
        setNewMsg("");
        fetchChats();
      }
    } catch (e) {}
  };

  const handleEndMeeting = async () => {
    if (confirm("Are you sure you want to end this meeting for everyone? This will generate AI summary reports.")) {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/end`, { method: "PUT" });
        if (res.ok) {
          stopCamera();
          localStorage.removeItem("is_sharing_crm");
          localStorage.removeItem("current_active_meeting_id");
          window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
          onLeave();
        }
      } catch (e) {}
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      await fetch(`/api/meetings/${meetingId}/leave`, { method: "POST" });
      stopCamera();
      localStorage.removeItem("is_sharing_crm");
      localStorage.removeItem("current_active_meeting_id");
      window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));
      onLeave();
    } catch (e) {}
  };

  const handleToggleMute = () => {
    const selfParticipant = participants.find(p => Number(p.id) === Number(currentUser?.id));
    if (selfParticipant?.mutedByHost) {
      alert("You have been muted by the host and cannot unmute yourself.");
      return;
    }
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    // Immediately reflect mute in the live stream so WebRTC peers hear the change
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !newMuted;
      });
    }
  };

  // Kick Participant Rules
  const isKickAllowed = (targetUser: any) => {
    if (Number(targetUser.id) === Number(currentUser?.id)) return false; 
    if (role === "boss") return true;
    if (role === "manager" && targetUser.role !== "boss") return true;
    if (role === "tl" && targetUser.role === "recruiter") return true;
    return false;
  };

  const canManageParticipant = (targetUser: any) => {
    if (Number(targetUser.id) === Number(currentUser?.id)) return false;
    const isHost = meeting && Number(meeting.hostId) === Number(currentUser?.id);
    if (isHost) return true;
    if (role === "boss") return true;
    if (role === "manager" && targetUser.role !== "boss") return true;
    if (role === "tl" && targetUser.role === "recruiter") return true;
    return false;
  };

  const handleKickParticipant = async (pId: number) => {
    if (confirm("Are you sure you want to kick this user from the meeting room?")) {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/kick`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: pId })
        });
        if (res.ok) {
          setKickedParticipants(prev => [...prev, pId]);
          alert("User has been removed from the session.");
          fetchDetails();
        }
      } catch (e) {
        console.error("Failed to kick participant:", e);
      }
    }
  };

  const handleMoveToWaitingRoom = (pId: number) => {
    setWaitingRoomList(prev => [...prev, pId]);
    alert("User moved to waiting room.");
  };

  const handleAdmitFromWaitingRoom = (pId: number) => {
    setWaitingRoomList(prev => prev.filter(id => id !== pId));
    alert("User admitted back into the meeting.");
  };

  const handleMuteParticipant = async (targetUserId: number, currentMuteState: boolean) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/mute-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, mute: !currentMuteState })
      });
      if (res.ok) {
        fetchDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMuteAllToggle = async () => {
    const targetState = !isMuteAllActive;
    try {
      const res = await fetch(`/api/meetings/${meetingId}/mute-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mute: targetState })
      });
      if (res.ok) {
        setIsMuteAllActive(targetState);
        fetchDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Disable all participant cameras (host action)
  const [isVideoAllOffActive, setIsVideoAllOffActive] = useState(false);

  const handleDisableAllVideoToggle = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/disable-all-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setIsVideoAllOffActive(true);
        fetchDetails();
        // Auto-reset flag after 3 seconds (it's a one-shot action)
        setTimeout(() => setIsVideoAllOffActive(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Disable a specific participant's camera (host action)
  const handleDisableParticipantVideo = async (targetUserId: number, currentDisableState: boolean) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/disable-user-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, disable: !currentDisableState })
      });
      if (res.ok) {
        fetchDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Online users for invite panel
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<Set<number>>(new Set());

  const fetchOnlineUsers = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/online-users`);
      if (res.ok) setOnlineUsers(await res.json());
    } catch (e) {}
  };

  // Poll online users every 5s when participants tab is active
  useEffect(() => {
    if (activeTab !== "participants") return;
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 5000);
    return () => clearInterval(interval);
  }, [meetingId, activeTab, participants]);

  const handleInviteUser = async (targetUserId: number) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/invite-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        setInvitedUsers(prev => new Set([...prev, targetUserId]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleHandRaise = async () => {
    const nextState = !isHandRaised;
    try {
      const res = await fetch(`/api/meetings/${meetingId}/handraise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handRaised: nextState })
      });
      if (res.ok) {
        setIsHandRaised(nextState);
        fetchDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isMeetingCreator = meeting && Number(meeting.hostId) === Number(currentUser?.id);

  // Modules available to screenshare
  const MODULES = [
    { id: "dashboard", name: "Executive Dashboard" },
    { id: "sourcing", name: "Sourcing Hub" },
    { id: "jobs", name: "Job Openings Matrix" },
    { id: "attendance", name: "Attendance Hub Log" },
    { id: "todo", name: "Operational To Do List" }
  ];

  const handleToggleScreenShare = (modId: string) => {
    if (isScreenSharing && sharedModule === modId) {
      setIsScreenSharing(false);
      setSharedModule("");
    } else {
      setIsScreenSharing(true);
      setSharedModule(modId);
    }
  };

  async function handleStartScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor"
        },
        audio: false
      });

      screenStreamRef.current = stream;
      const screenTrack = stream.getVideoTracks()[0];

      screenTrack.onended = () => {
        handleStopScreenShare();
      };

      // Replace the video track in all active peer connections
      Object.values(peersRef.current).forEach(pc => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      });

      setIsScreenSharing(true);
      localStorage.setItem("is_sharing_crm", "true");
      window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));

      // Send telemetry update
      await fetch(`/api/meetings/${meetingId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          micActive: !isMuted,
          cameraActive: false,
          screenshareActive: true,
          disconnected: false
        })
      });

      // Navigate to the main dashboard page so they can use the CRM
      navigate(`/dashboard/${role}/dashboard`);

    } catch (err) {
      console.error("Failed to start screen share:", err);
      handleStopScreenShare();
    }
  }

  async function handleStopScreenShare() {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    Object.values(peersRef.current).forEach(pc => {
      const senders = pc.getSenders();
      const videoSender = senders.find(s => s.track && s.track.kind === "video");
      if (videoSender && cameraTrack) {
        cameraTrack.enabled = !isCameraOff;
        videoSender.replaceTrack(cameraTrack);
      }
    });

    setIsScreenSharing(false);
    localStorage.removeItem("is_sharing_crm");
    window.dispatchEvent(new Event("MEETING_STATE_CHANGED"));

    try {
      await fetch(`/api/meetings/${meetingId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          micActive: !isMuted,
          cameraActive: !isCameraOff,
          screenshareActive: false,
          disconnected: false
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  const showSidebar = !isPip;
  const containerHeight = "100%";
  const sidebarWidth = showSidebar ? (isFullscreen ? 360 : 260) : 0;
  const leftPaneWidth = containerWidth - sidebarWidth;
  const controlsWidth = leftPaneWidth - (isPip ? 16 : 32);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        height: containerHeight,
        background: "#0f172a",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Remote Audio Stream Analyzers and Audio Elements */}
      {participants.map((p) => {
        const isSelf = Number(p.id) === Number(currentUser?.id);
        if (isSelf) return null;
        return (
          <React.Fragment key={`remote-media-${p.id}`}>
            <RemoteStreamAnalyzer
              stream={remoteStreams[p.id] || null}
              userId={p.id}
              isMutedOrInactive={!p.micActive || p.mutedByHost}
              onChange={(uId, speaking) => {
                setSpeakingStates(prev => {
                  if (prev[uId] === speaking) return prev;
                  return { ...prev, [uId]: speaking };
                });
              }}
            />
            <audio
              ref={(el) => {
                if (el) {
                  audioElementsRef.current[p.id] = el;
                  if (remoteStreams[p.id]) {
                    if (el.srcObject !== remoteStreams[p.id]) {
                      el.srcObject = remoteStreams[p.id];
                    }
                    el.volume = volume / 100;
                    el.play().catch(() => {});
                  }
                } else {
                  delete audioElementsRef.current[p.id];
                }
              }}
              autoPlay
              playsInline
              style={{ display: "none" }}
            />
          </React.Fragment>
        );
      })}

      {/* LEFT CONTENT: Screen Share / Video Grid */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#020617",
          padding: isPip ? "8px" : "16px"
        }}
      >
        {/* Header Indicator Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isPip ? "4px 8px" : "8px 16px",
            background: "rgba(30, 41, 59, 0.6)",
            borderRadius: "12px",
            marginBottom: isPip ? "8px" : "16px",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }}></span>
            <strong style={{ fontSize: isPip ? "0.75rem" : "0.85rem", color: "#f8fafc" }}>
              {meeting?.title || "Live Meeting Room"}
            </strong>
            {!isPip && (
              <span style={{ fontSize: "0.68rem", background: "rgba(59,130,246,0.15)", color: "#60a5fa", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>
                {meeting?.priority?.toUpperCase()} PRIORITY
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!isPip && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                {isFullscreen ? <LucideMinimize size={16} /> : <LucideMaximize size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: "16px" }}>
          {isScreenSharing ? (
            /* Real Screenshare Video Player */
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#090d16",
                borderRadius: "16px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)"
              }}
            >
              {/* Presentation Header Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#1e293b",
                  color: "#ffffff",
                  padding: "10px 16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 2
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="screenshare-pulse-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#60a5fa", display: "inline-block" }}></span>
                  <style>{`
                    .screenshare-pulse-dot {
                      animation: screenshare-pulse 1.5s infinite;
                    }
                    @keyframes screenshare-pulse {
                      0% { transform: scale(0.9); opacity: 0.5; }
                      50% { transform: scale(1.2); opacity: 1; }
                      100% { transform: scale(0.9); opacity: 0.5; }
                    }
                  `}</style>
                  <LucideMonitor size={18} color="#60a5fa" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                    PRESENTATION MODE: {(() => {
                      const presenterObj = participants.find(p => Number(p.id) === Number(meeting?.presenterId));
                      return presenterObj?.name || "Presenter";
                    })()} is sharing screen (Read-Only)
                  </span>
                </div>
                {Number(meeting?.presenterId) === Number(currentUser?.id) && (
                  <button
                    onClick={handleStopScreenShare}
                    style={{
                      background: "#ef4444",
                      border: "none",
                      color: "white",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
                  >
                    Stop Sharing
                  </button>
                )}
              </div>

              {/* Screenshare Video Box */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <video
                  ref={screenshareVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain"
                  }}
                />
              </div>
            </div>
          ) : (
            /* Meeting Video Grid */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPip ? "1fr" : participants.length <= 1 ? "1fr" : participants.length <= 2 ? "1fr 1fr" : "1fr 1fr 1fr",
                gridGap: isPip ? "8px" : "16px",
                width: "100%",
                height: "100%",
                alignContent: "center",
                justifyContent: "center",
                overflowY: "auto",
                padding: isPip ? "0" : "8px"
              }}
            >
              {participants.map((p) => {
                const isSelf = Number(p.id) === Number(currentUser?.id);
                const isWaiting = waitingRoomList.includes(p.id);
                if (isWaiting) return null;

                return (
                  <motion.div
                    key={p.id}
                    style={{
                      background: "rgba(30, 41, 59, 0.4)",
                      borderRadius: "16px",
                      border: p.isSpeaking ? "3px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: p.isSpeaking ? "0 0 15px rgba(59, 130, 246, 0.4)" : "none",
                      // Square tiles using aspect-ratio
                      aspectRatio: isPip ? "auto" : "1 / 1",
                      height: isPip ? "80px" : "auto",
                      width: "100%",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border 0.2s ease"
                    }}
                  >
                    {/* Camera Video Stream */}
                    {isSelf && !isCameraOff ? (
                      !webcamFailed ? (
                        <video
                          ref={setLocalVideoEl}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: "scaleX(-1)"
                          }}
                        />
                      ) : (
                        <SimulatedVideo name={currentUser?.name || "You"} isSpeaking={!isMuted && isSelfSpeaking} isSelf={true} />
                      )
                    ) : !isSelf && remoteStreams[p.id] ? (
                      // Remote participant has a live stream — show video + always attach audio
                      <>
                        <video
                          ref={(el) => {
                            if (el) {
                              if (el.srcObject !== remoteStreams[p.id]) {
                                el.srcObject = remoteStreams[p.id];
                              }
                            }
                          }}
                          autoPlay
                          playsInline
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: p.camActive ? 1 : 0,
                            position: p.camActive ? "relative" : "absolute",
                            pointerEvents: p.camActive ? "auto" : "none",
                            zIndex: p.camActive ? 1 : 0
                          }}
                        />
                        {!p.camActive && (
                          <SimulatedVideo name={p.name} isSpeaking={p.isSpeaking} />
                        )}
                      </>
                    ) : !isSelf && p.camActive ? (
                      <SimulatedVideo name={p.name} isSpeaking={p.isSpeaking} />
                    ) : (
                      /* Participant high fidelity mock container */
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: isPip ? "4px" : "10px",
                          zIndex: 1
                        }}
                      >
                        {/* No audio element here — handled in remote stream block above */}

                        <div
                          style={{
                            width: isPip ? "36px" : "70px",
                            height: isPip ? "36px" : "70px",
                            borderRadius: "50%",
                            background: p.isHost
                              ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)"
                              : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontSize: isPip ? "0.95rem" : "1.4rem",
                            fontWeight: 900,
                            boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
                          }}
                        >
                          {(p.name?.[0] || "U")}
                        </div>

                        {/* Speaking Pulsing Rings */}
                        {p.isSpeaking && !isMuted && !isPip && (
                          <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
                            <span style={{ display: "inline-block", width: "3px", height: "12px", background: "#60a5fa", animation: "bounce 0.8s infinite 0.1s" }}></span>
                            <span style={{ display: "inline-block", width: "3px", height: "16px", background: "#60a5fa", animation: "bounce 0.8s infinite 0.2s" }}></span>
                            <span style={{ display: "inline-block", width: "3px", height: "10px", background: "#60a5fa", animation: "bounce 0.8s infinite 0.3s" }}></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Participant Labels */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: isPip ? "4px" : "10px",
                        left: isPip ? "4px" : "10px",
                        right: isPip ? "4px" : "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "rgba(15, 23, 42, 0.7)",
                        backdropFilter: "blur(6px)",
                        padding: isPip ? "2px 6px" : "4px 10px",
                        borderRadius: "8px",
                        zIndex: 2
                      }}
                    >
                      <span style={{ fontSize: isPip ? "0.6rem" : "0.75rem", color: "#f8fafc", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                        {p.isHost && <LucideCrown size={isPip ? 10 : 12} color="#f59e0b" />}
                        {isSelf ? "You" : p.name}
                      </span>

                      <div style={{ display: "flex", gap: "4px" }}>
                        {isSelf ? (
                          isMuted ? <LucideMicOff size={isPip ? 10 : 12} color="#ef4444" /> : <LucideMic size={isPip ? 10 : 12} color="#10b981" />
                        ) : (
                          p.micActive ? <LucideMic size={isPip ? 10 : 12} color="#10b981" /> : <LucideMicOff size={isPip ? 10 : 12} color="#ef4444" />
                        )}
                        {isSelf ? (
                          isCameraOff ? <LucideVideoOff size={isPip ? 10 : 12} color="#ef4444" /> : <LucideVideo size={isPip ? 10 : 12} color="#10b981" />
                        ) : (
                          p.camActive ? <LucideVideo size={isPip ? 10 : 12} color="#10b981" /> : <LucideVideoOff size={isPip ? 10 : 12} color="#ef4444" />
                        )}
                      </div>
                    </div>

                    {/* Hand raise overlay on video card */}
                    {p.handRaised && (
                      <div
                        style={{
                          position: "absolute",
                          top: isPip ? "4px" : "10px",
                          left: isPip ? "4px" : "10px",
                          background: "#fbbf24",
                          color: "#1e293b",
                          borderRadius: "50%",
                          width: isPip ? "20px" : "28px",
                          height: isPip ? "20px" : "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 0 10px #fbbf24",
                          fontSize: isPip ? "0.75rem" : "1.1rem",
                          zIndex: 10,
                          fontWeight: "bold",
                          animation: "pulse 1.2s infinite"
                        }}
                        title="Hand Raised"
                      >
                        ✋
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM MEETING CONTROLS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isPip ? "8px 10px" : (isFullscreen ? "16px 20px" : (controlsWidth < 450 ? "6px 8px" : "10px 12px")),
            background: "rgba(30, 41, 59, 0.8)",
            borderRadius: "16px",
            marginTop: isPip ? "8px" : "16px",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          {/* Mute/Camera Toggles */}
          <div style={{ display: "flex", gap: isPip ? "6px" : (isFullscreen ? "10px" : (controlsWidth < 450 ? "4px" : "6px")), alignItems: "center" }}>
            <button
              onClick={handleToggleMute}
              style={{
                width: isPip ? "32px" : (isFullscreen ? "42px" : (controlsWidth < 450 ? "34px" : "42px")),
                height: isPip ? "32px" : (isFullscreen ? "42px" : (controlsWidth < 450 ? "34px" : "42px")),
                borderRadius: "50%",
                border: "none",
                background: isMuted ? "#ef4444" : "rgba(255,255,255,0.1)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {isMuted ? <LucideMicOff size={isPip ? 14 : (isFullscreen ? 18 : (controlsWidth < 450 ? 14 : 18))} /> : <LucideMic size={isPip ? 14 : (isFullscreen ? 18 : (controlsWidth < 450 ? 14 : 18))} />}
            </button>

            <button
              onClick={() => {
                const selfAtt = participants.find(p => Number(p.id) === Number(currentUser?.id));
                if (selfAtt?.videoDisabledByHost) {
                  alert("Your video has been disabled by the host.");
                  return;
                }
                setIsCameraOff(!isCameraOff);
              }}
              style={{
                width: isPip ? "32px" : (isFullscreen ? "42px" : (controlsWidth < 450 ? "34px" : "42px")),
                height: isPip ? "32px" : (isFullscreen ? "42px" : (controlsWidth < 450 ? "34px" : "42px")),
                borderRadius: "50%",
                border: "none",
                background: isCameraOff ? "#ef4444" : "rgba(255,255,255,0.1)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {isCameraOff ? <LucideVideoOff size={isPip ? 14 : (isFullscreen ? 18 : (controlsWidth < 450 ? 14 : 18))} /> : <LucideVideo size={isPip ? 14 : (isFullscreen ? 18 : (controlsWidth < 450 ? 14 : 18))} />}
            </button>

            {!isPip && controlsWidth >= 380 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: isFullscreen ? "10px" : "4px", background: "rgba(0,0,0,0.2)", padding: isFullscreen ? "4px 10px" : "3px 6px", borderRadius: "20px" }}>
                <LucideVolume2 size={isFullscreen ? 14 : 12} color="#94a3b8" />
                <input
                  type="range"
                  min="0" max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{ width: isFullscreen ? "60px" : "36px", height: "4px", cursor: "pointer" }}
                />
              </div>
            )}
          </div>

          {/* Core Feature Controls (Screenshare, Mute all / Handraise) */}
          {!isPip && (
            <div style={{ display: "flex", gap: isFullscreen ? "10px" : (controlsWidth < 450 ? "4px" : "6px") }}>
              {/* Screen Share Trigger */}
              <button
                onClick={handleStartScreenShare}
                style={{
                  padding: isFullscreen ? "10px 16px" : (controlsWidth < 450 ? "6px 8px" : "8px 10px"),
                  borderRadius: "10px",
                  border: "none",
                  background: isScreenSharing ? "#2563eb" : "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                  fontSize: isFullscreen ? "0.8rem" : (controlsWidth < 450 ? "0.62rem" : "0.7rem"),
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer"
                }}
                title="Share Screen"
              >
                <LucideMonitor size={isFullscreen ? 16 : (controlsWidth < 450 ? 12 : 13)} />
                {controlsWidth >= 420 ? " Share Screen" : controlsWidth >= 340 ? " Share" : ""}
              </button>

              {/* Mute all / Disable Video / Handraise Button */}
              {isMeetingCreator || role === "boss" || role === "manager" || role === "tl" ? (
                <>
                  <button
                    onClick={handleMuteAllToggle}
                    style={{
                      padding: isFullscreen ? "10px 16px" : (controlsWidth < 450 ? "6px 8px" : "8px 10px"),
                      borderRadius: "10px",
                      border: "none",
                      background: isMuteAllActive ? "#ef4444" : "rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      fontSize: isFullscreen ? "0.8rem" : (controlsWidth < 450 ? "0.62rem" : "0.7rem"),
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer"
                    }}
                    title={isMuteAllActive ? "Unmute all" : "Mute all"}
                  >
                    <LucideMicOff size={isFullscreen ? 16 : (controlsWidth < 450 ? 12 : 13)} />
                    {controlsWidth >= 420 ? (isMuteAllActive ? " Unmute all" : " Mute all") : controlsWidth >= 340 ? (isMuteAllActive ? " Unmute" : " Mute") : ""}
                  </button>
                  <button
                    onClick={handleDisableAllVideoToggle}
                    style={{
                      padding: isFullscreen ? "10px 16px" : (controlsWidth < 450 ? "6px 8px" : "8px 10px"),
                      borderRadius: "10px",
                      border: "none",
                      background: isVideoAllOffActive ? "#f59e0b" : "rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      fontSize: isFullscreen ? "0.8rem" : (controlsWidth < 450 ? "0.62rem" : "0.7rem"),
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer"
                    }}
                    title="Disable all cameras"
                  >
                    <LucideVideoOff size={isFullscreen ? 16 : (controlsWidth < 450 ? 12 : 13)} />
                    {controlsWidth >= 420 ? " Off All Video" : controlsWidth >= 340 ? " Off Video" : ""}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleToggleHandRaise}
                  style={{
                    padding: isFullscreen ? "10px 16px" : (controlsWidth < 450 ? "6px 8px" : "8px 10px"),
                    borderRadius: "10px",
                    border: "none",
                    background: isHandRaised ? "#f59e0b" : "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontSize: isFullscreen ? "0.8rem" : (controlsWidth < 450 ? "0.62rem" : "0.7rem"),
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer"
                  }}
                  title={isHandRaised ? "Lower Hand" : "Raise Hand"}
                >
                  <span>✋</span>
                  {controlsWidth >= 420 ? (isHandRaised ? " Lower Hand" : " Raise Hand") : controlsWidth >= 340 ? (isHandRaised ? " Lower" : " Raise") : ""}
                </button>
              )}
            </div>
          )}

          {/* End Call / Leave Call */}
          <div style={{ display: "flex", gap: "4px" }}>
            {isMeetingCreator || role === "boss" ? (
              <button
                onClick={handleEndMeeting}
                style={{
                  padding: isPip ? "6px 12px" : (isFullscreen ? "10px 20px" : (controlsWidth < 450 ? "6px 8px" : "8px 12px")),
                  borderRadius: "10px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: isPip ? "0.7rem" : (isFullscreen ? "0.8rem" : (controlsWidth < 450 ? "0.62rem" : "0.7rem")),
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                title="End Meeting"
              >
                <LucidePhoneOff size={isPip ? 12 : (isFullscreen ? 16 : (controlsWidth < 450 ? 12 : 13))} />
                {isPip ? "End" : (controlsWidth >= 420 ? " End Meeting" : controlsWidth >= 340 ? " End" : "")}
              </button>
            ) : (
              <button
                onClick={handleLeaveMeeting}
                style={{
                  padding: isPip ? "6px 12px" : (isFullscreen ? "10px 20px" : (controlsWidth < 450 ? "6px 8px" : "8px 12px")),
                  borderRadius: "10px",
                  border: "none",
                  background: "#e11d48",
                  color: "#ffffff",
                  fontSize: isPip ? "0.7rem" : (isFullscreen ? "0.8rem" : (controlsWidth < 450 ? "0.62rem" : "0.7rem")),
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                title="Leave Room"
              >
                <LucidePhoneOff size={isPip ? 12 : (isFullscreen ? 16 : (controlsWidth < 450 ? 12 : 13))} />
                {isPip ? "Leave" : (controlsWidth >= 420 ? " Leave Room" : controlsWidth >= 340 ? " Leave" : "")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL: Chat, Participants */}
      {showSidebar && (
        <div
          style={{
            width: isFullscreen ? "360px" : "260px",
            background: "rgba(30, 41, 59, 0.4)",
            backdropFilter: "blur(12px)",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            transition: "width 0.3s ease"
          }}
        >
          {/* Right Sidebar Tab Rows */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 10px 0" }}>
            <button
              onClick={() => setActiveTab("participants")}
              style={{
                flex: 1,
                padding: "12px 0",
                background: "none",
                border: "none",
                borderBottom: activeTab === "participants" ? "3px solid #3b82f6" : "none",
                color: activeTab === "participants" ? "#f8fafc" : "#94a3b8",
                fontSize: "0.75rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              <LucideUsers size={14} /> Participants ({participants.length})
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              style={{
                flex: 1,
                padding: "12px 0",
                background: "none",
                border: "none",
                borderBottom: activeTab === "chat" ? "3px solid #3b82f6" : "none",
                color: activeTab === "chat" ? "#f8fafc" : "#94a3b8",
                fontSize: "0.75rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                position: "relative"
              }}
            >
              <LucideMessageSquare size={14} /> Chat
              {unreadChatCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "12px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    boxShadow: "0 0 8px #ef4444"
                  }}
                  title={`${unreadChatCount} unread message(s)`}
                />
              )}
            </button>
          </div>

          {/* Tab View Contents */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {activeTab === "participants" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Waiting Room Sector */}
                {waitingRoomList.length > 0 && (
                  <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "10px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "0.65rem", color: "#fbbf24", fontWeight: 800, marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <LucideShield size={12} /> Waiting Room ({waitingRoomList.length})
                    </div>
                    {waitingRoomList.map(wId => {
                      const u = participants.find(p => p.id === wId);
                      if (!u) return null;
                      return (
                        <div key={wId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "#f8fafc", fontWeight: 600 }}>{u.name}</span>
                          {isMeetingCreator && (
                            <button
                              onClick={() => handleAdmitFromWaitingRoom(wId)}
                              style={{ background: "#10b981", border: "none", color: "white", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: 800 }}
                            >
                              Admit
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Live Users Directory */}
                {participants.map((p) => {
                  const isSelf = Number(p.id) === Number(currentUser?.id);
                  const isWaiting = waitingRoomList.includes(p.id);
                  if (isWaiting) return null;

                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.03)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></span>
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }}>
                            {isSelf ? "You" : p.name}
                            {p.handRaised && (
                              <span style={{ color: "#fbbf24", animation: "pulse 1.2s infinite" }} title="Hand Raised">✋</span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.58rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                            {p.role}
                          </div>
                        </div>
                      </div>

                      {/* Management controls — mic, camera disable, kick */}
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {canManageParticipant(p) && (
                          <>
                            <button
                              onClick={() => handleMuteParticipant(p.id, !!p.mutedByHost)}
                              title={p.mutedByHost ? "Unmute Participant" : "Mute Participant"}
                              style={{
                                background: p.mutedByHost ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.08)",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px",
                                color: p.mutedByHost ? "#ef4444" : "#cbd5e1",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              {p.mutedByHost ? <LucideMicOff size={12} /> : <LucideMic size={12} />}
                            </button>
                            <button
                              onClick={() => handleDisableParticipantVideo(p.id, !!p.videoDisabledByHost)}
                              title={p.videoDisabledByHost ? "Enable camera" : "Turn off camera"}
                              style={{
                                background: p.videoDisabledByHost ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.08)",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px",
                                color: p.videoDisabledByHost ? "#ef4444" : "#cbd5e1",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              {p.videoDisabledByHost ? <LucideVideoOff size={12} /> : <LucideVideo size={12} />}
                            </button>
                          </>
                        )}
                        {isKickAllowed(p) && (
                          <>
                            <button
                              onClick={() => handleKickParticipant(p.id)}
                              title="Remove Participant"
                              style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px",
                                color: "#f87171",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              <LucideUserMinus size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Invite Users Section (Visible to Host/Admin/Manager/TL) */}
                {(isMeetingCreator || role === "boss" || role === "manager" || role === "tl") && (
                  <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "15px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#60a5fa", fontWeight: 800, marginBottom: "10px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                      <LucidePlus size={14} /> Invite Online Users
                    </div>
                    {onlineUsers.length === 0 ? (
                      <div style={{ fontSize: "0.7rem", color: "#64748b", fontStyle: "italic", padding: "4px" }}>
                        No other online users found
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto", paddingRight: "4px" }}>
                        {onlineUsers.map((u) => {
                          const isInvited = invitedUsers.has(u.id);
                          return (
                            <div
                              key={u.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "6px 10px",
                                background: "rgba(255,255,255,0.02)",
                                borderRadius: "6px",
                                border: "1px solid rgba(255,255,255,0.03)"
                              }}
                            >
                              <div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1" }}>{u.name}</div>
                                <div style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{u.role}</div>
                              </div>
                              <button
                                onClick={() => handleInviteUser(u.id)}
                                disabled={isInvited}
                                style={{
                                  background: isInvited ? "rgba(255,255,255,0.05)" : "#2563eb",
                                  border: "none",
                                  borderRadius: "6px",
                                  color: isInvited ? "#94a3b8" : "white",
                                  fontSize: "0.65rem",
                                  fontWeight: 800,
                                  padding: "4px 10px",
                                  cursor: isInvited ? "default" : "pointer",
                                  transition: "background 0.2s"
                                }}
                              >
                                {isInvited ? "Invited" : "Call"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "chat" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto", marginBottom: "16px", paddingRight: "4px" }}>
                  {chatMessages.map((msg, index) => {
                    const isOwn = Number(msg.senderId) === Number(currentUser?.id);
                    return (
                      <div
                        key={index}
                        style={{
                          alignSelf: isOwn ? "flex-end" : "flex-start",
                          maxWidth: "80%",
                          background: isOwn ? "#2563eb" : "rgba(255,255,255,0.06)",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          border: isOwn ? "none" : "1px solid rgba(255,255,255,0.05)"
                        }}
                      >
                        {!isOwn && (
                          <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#60a5fa", marginBottom: "2px", textTransform: "uppercase" }}>
                            {msg.senderName} ({msg.senderRole})
                          </div>
                        )}
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#f8fafc", wordBreak: "break-all", fontWeight: 500 }}>
                          {msg.message}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Composer Form */}
                <form onSubmit={handleSendChat} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    style={{
                      flex: 1,
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "0.75rem",
                      color: "white",
                      outline: "none"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#2563eb",
                      border: "none",
                      borderRadius: "8px",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    <LucideSend size={12} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Toast Notification */}
      {chatToast && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "10px",
            padding: "10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            zIndex: 99999,
            maxWidth: "280px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.72rem", color: "#60a5fa", fontWeight: 700 }}>
              ✉️ New Message from {chatToast.senderName}
            </span>
            <button
              onClick={() => setChatToast(null)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "0.7rem",
                padding: "2px"
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: "0.68rem", color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {chatToast.message}
          </p>
        </div>
      )}
    </div>
  );
}

function SharedBossDashboard() {
  const [monitoring, setMonitoring] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [monRes, candRes] = await Promise.all([
        fetch("/api/boss/team-monitoring"),
        fetch("/api/candidates")
      ]);
      if (monRes.ok) {
        const monData = await monRes.json();
        setMonitoring(monData);
      }
      if (candRes.ok) {
        const candData = await candRes.json();
        setCandidates(candData);
      }
    } catch (err) {
      console.error("Error fetching SharedBossDashboard telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#64748b", background: "#f8fafc", borderRadius: "16px" }}>
        <LucideSparkles size={32} style={{ marginRight: "8px", animation: "spin 2s linear infinite" }} />
        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Loading Executive Telemetry Feed...</span>
      </div>
    );
  }

  const kpi = monitoring?.kpi || {
    totalEmployees: 0,
    currentlyOnline: 0,
    currentlyWorking: 0,
    currentlyOnBreak: 0,
    currentlyOffline: 0,
    todayRegistrations: 0,
    todayLeads: 0,
    todayInterviews: 0,
    todayJoinings: 0
  };
  const rawUserList = monitoring?.userList || [];
  const userList = rawUserList.map((u: any) => {
    const statusVal = u.status?.toLowerCase();
    let normalizedStatus = "offline";
    if (statusVal === "working" || statusVal === "idle" || statusVal === "active") {
      normalizedStatus = "active";
    } else if (statusVal === "break" || statusVal === "lunch break" || statusVal === "on break") {
      normalizedStatus = "break";
    }
    return {
      ...u,
      status: normalizedStatus,
      workingHours: u.workingHoursToday || u.workingHours,
      breakTime: u.totalBreakTime || u.breakTime
    };
  });

  const totalMGR = userList.filter((u: any) => u.role === "manager").length;
  const totalTL = userList.filter((u: any) => u.role === "tl").length;
  const totalREC = userList.filter((u: any) => u.role === "recruiter").length;

  const connectedCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase() === "connected" || (c.status || "").toLowerCase() === "connected").length;
  const interestedCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase() === "interested" || (c.status || "").toLowerCase() === "interested").length;
  const interviewCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase() === "go for interview" || (c.status || "").toLowerCase() === "go for interview" || c.interviewDate).length;
  const selectedCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase() === "selected" || (c.status || "").toLowerCase() === "selected" || (c.status || "").toLowerCase() === "hired").length;
  const joinedCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase().includes("join") || (c.status || "").toLowerCase() === "joined").length;

  const totalCands = candidates.length || 1;
  const connectedConv = Math.round((connectedCount / totalCands) * 100);
  const interestedConv = connectedCount > 0 ? Math.round((interestedCount / connectedCount) * 100) : 0;
  const interviewConv = interestedCount > 0 ? Math.round((interviewCount / interestedCount) * 100) : 0;
  const selectedConv = interviewCount > 0 ? Math.round((selectedCount / interviewCount) * 100) : 0;
  const joinedConv = selectedCount > 0 ? Math.round((joinedCount / selectedCount) * 100) : 0;

  const notConnectedCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase() === "not connected" || (c.status || "").toLowerCase() === "not connected").length;
  const notInterestedCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase() === "not interested" || (c.status || "").toLowerCase() === "not interested").length;
  const callNotPickCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase() === "call not pick" || (c.status || "").toLowerCase() === "call not pick").length;
  const rejectedCount = candidates.filter((c: any) => (c.remarks || "").toLowerCase() === "rejected" || (c.status || "").toLowerCase() === "rejected").length;

  return (
    <div style={{ padding: "16px", height: "100%", overflowY: "auto", color: "#1e293b", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", padding: "12px 18px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <div>
          <span style={{ fontSize: "0.55rem", fontWeight: 900, background: "#3b82f6", color: "white", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Feed</span>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 850, color: "white", margin: "2px 0 0" }}>Live Corporate Executive Telemetry</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "4px 10px", borderRadius: "20px", fontWeight: 700 }}>
          <span className="live-dot-blink" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
          BROADCASTING LIVE
        </div>
      </div>

      <style>{`
        .live-dot-blink {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .telemetry-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: all 0.2s;
        }
        .telemetry-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* KPI Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        <div className="telemetry-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Workforce Summary</span>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, margin: "4px 0", color: "#1e293b" }}>
            {kpi.totalEmployees} <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Employees</span>
          </h2>
          <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>
            MGR: {totalMGR} | TL: {totalTL} | REC: {totalREC}
          </div>
        </div>

        <div className="telemetry-card" style={{ borderLeft: "4px solid #10b981" }}>
          <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Live Activity Log</span>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, margin: "4px 0", color: "#10b981" }}>
            {kpi.currentlyOnline} <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Online</span>
          </h2>
          <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>
            Work: {kpi.currentlyWorking} | Break: {kpi.currentlyOnBreak} | Offline: {kpi.currentlyOffline}
          </div>
        </div>

        <div className="telemetry-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Productivity Pulse</span>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, margin: "4px 0", color: "#f59e0b" }}>
            {Math.round((kpi.currentlyWorking / (kpi.totalEmployees || 1)) * 100)}% <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Today</span>
          </h2>
          <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>
            Reg: {kpi.todayRegistrations} | Int: {kpi.todayInterviews} | Joined: {kpi.todayJoinings}
          </div>
        </div>

        <div className="telemetry-card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Today's Snapshot</span>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, margin: "4px 0", color: "#8b5cf6" }}>
            {kpi.todayJoinings} <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Joined Today</span>
          </h2>
          <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>
            Sourced: {kpi.todayRegistrations} | Interviews: {kpi.todayInterviews}
          </div>
        </div>
      </div>

      {/* Live Desking & Scoreboard Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
        
        {/* Desking Table */}
        <div className="telemetry-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ background: "#0f172a", color: "white", padding: "8px 12px", fontSize: "0.75rem", fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>SECTION 3: LIVE DESKING STATUS TELEMETRY</span>
            <span style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", padding: "1px 6px", borderRadius: "4px", fontSize: "0.6rem" }}>
              {userList.length} Staff Mapped
            </span>
          </div>
          <div style={{ padding: "8px", overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.72rem", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontWeight: 700 }}>
                  <th style={{ padding: "6px" }}>EMPLOYEE</th>
                  <th style={{ padding: "6px" }}>ROLE</th>
                  <th style={{ padding: "6px" }}>LOGIN</th>
                  <th style={{ padding: "6px" }}>STATUS</th>
                  <th style={{ padding: "6px" }}>WORKING HRS</th>
                  <th style={{ padding: "6px" }}>BREAK TIME</th>
                  <th style={{ padding: "6px" }}>TASKS</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((emp: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 6px", fontWeight: 700, color: "#334155" }}>{emp.name}</td>
                    <td style={{ padding: "8px 6px", textTransform: "uppercase", fontSize: "0.62rem", color: "#64748b", fontWeight: 800 }}>{emp.role}</td>
                    <td style={{ padding: "8px 6px", color: "#475569" }}>{emp.checkInTime || "N/A"}</td>
                    <td style={{ padding: "8px 6px" }}>
                      <span style={{
                        background: emp.status === "active" ? "#ecfdf5" : emp.status === "break" ? "#fffbeb" : "#f1f5f9",
                        color: emp.status === "active" ? "#10b981" : emp.status === "break" ? "#d97706" : "#64748b",
                        border: "1px solid currentColor",
                        borderRadius: "20px",
                        padding: "1px 6px",
                        fontSize: "0.6rem",
                        fontWeight: 800
                      }}>
                        {emp.status === "active" ? "🟢 ONLINE" : emp.status === "break" ? "🟡 BREAK" : "⚫ OFFLINE"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 6px", fontWeight: 600 }}>{emp.workingHours || "0.0 hrs"}</td>
                    <td style={{ padding: "8px 6px" }}>{emp.breakTime || "0m"}</td>
                    <td style={{ padding: "8px 6px", color: "#ef4444", fontWeight: 700 }}>
                      {emp.tasks?.activeTasks || 0} active
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="telemetry-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ background: "#0f172a", color: "white", padding: "8px 12px", fontSize: "0.75rem", fontWeight: 800 }}>
            SECTION 4: GAMIFIED PERFORMANCE SCOREBOARD
          </div>
          <div style={{ padding: "8px" }}>
            {userList.slice(0, 5).map((emp: any, idx: number) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 900 }}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </span>
                  <div>
                    <strong style={{ fontSize: "0.75rem", color: "#334155" }}>{emp.name}</strong>
                    <span style={{ display: "block", fontSize: "0.6rem", color: "#94a3b8" }}>{emp.role?.toUpperCase()}</span>
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "6px" }}>
                  {emp.performance?.productivityScore || 10}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel Pipeline */}
      <div className="telemetry-card" style={{ marginBottom: "16px", padding: "0", overflow: "hidden" }}>
        <div style={{ background: "#0f172a", color: "white", padding: "8px 12px", fontSize: "0.75rem", fontWeight: 800 }}>
          SECTION 5: DYNAMIC EXECUTIVE FUNNEL PIPELINE
        </div>
        <div style={{ padding: "12px", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
          {[
            { stage: "REGISTERED", count: totalCands, color: "#4f46e5", p: `${connectedConv}%`, desc: "Initial Entry" },
            { stage: "CONNECTED", count: connectedCount, color: "#2563eb", p: `${interestedConv}%`, desc: "First Contact" },
            { stage: "INTERESTED", count: interestedCount, color: "#0d9488", p: `${interviewConv}%`, desc: "Lead Warmup" },
            { stage: "INTERVIEWS", count: interviewCount, color: "#b45309", p: `${selectedConv}%`, desc: "Evaluation" },
            { stage: "SELECTED", count: selectedCount, color: "#db2777", p: `${joinedConv}%`, desc: "Offer Issued" },
            { stage: "JOINED", count: joinedCount, color: "#16a34a", p: "100%", desc: "Placed" }
          ].map((step, idx) => (
            <div key={idx} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderTop: `3px solid ${step.color}`, borderRadius: "6px", padding: "6px", textAlign: "center" }}>
              <span style={{ fontSize: "0.55rem", color: "#64748b", display: "block", fontWeight: 800 }}>{step.stage}</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: step.color, margin: "2px 0" }}>{step.count}</h3>
              <div style={{ fontSize: "0.5rem", color: "#94a3b8", fontWeight: 600, marginBottom: "2px" }}>{step.desc}</div>
              <span style={{ fontSize: "0.55rem", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "1px 4px", borderRadius: "6px", color: "#334155", fontWeight: 700 }}>Conv: {step.p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Status Nodes */}
      <div className="telemetry-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ background: "#0f172a", color: "white", padding: "8px 12px", fontSize: "0.75rem", fontWeight: 800 }}>
          SECTION 6: CANDIDATE STATUS NODES
        </div>
        <div style={{ padding: "12px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
          {[
            { label: "Connected", val: connectedCount },
            { label: "Not Connected", val: notConnectedCount },
            { label: "Interested", val: interestedCount },
            { label: "Not Interested", val: notInterestedCount },
            { label: "Call Not Pick", val: callNotPickCount },
            { label: "Scheduled", val: interviewCount },
            { label: "Selected", val: selectedCount },
            { label: "Rejected", val: rejectedCount },
            { label: "Joined", val: joinedCount }
          ].map((item, idx) => (
            <div key={idx} style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "6px", textAlign: "center" }}>
              <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700, display: "block" }}>{item.label}</span>
              <strong style={{ fontSize: "0.9rem", color: "#1e293b", marginTop: "2px", display: "block" }}>{item.val}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
