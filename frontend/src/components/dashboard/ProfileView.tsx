import React, { useState, useEffect, useRef } from "react";
import {
  LucideUser,
  LucidePhone,
  LucideMail,
  LucideBriefcase,
  LucideMapPin,
  LucideCalendar,
  LucideLock,
  LucideEye,
  LucideEyeOff,
  LucidePlus,
  LucideTrash2,
  LucideUpload,
  LucideDownload,
  LucideSave,
  LucideX,
  LucideEdit,
  LucideCheck,
  LucideInfo,
  LucideLaptop,
  LucideHistory,
  LucideFileText,
  LucideRefreshCw,
  LucideFileUp,
  LucideActivity,
  LucideHeart,
  LucideFingerprint,
  LucideShield,
  LucideUserCheck,
  LucideSparkles,
  LucideLoader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileViewProps {
  role: "superadmin" | "boss" | "manager" | "tl" | "recruiter";
  userId: number; // The user whose profile is being viewed
  onClose?: () => void; // Optional close handler if opened in modal
}

export default function ProfileView({ role, userId, onClose }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "identity" | "assets" | "timeline" | "policy">("personal");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [otherDocs, setOtherDocs] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // Edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isEditingEmpInfo, setIsEditingEmpInfo] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState<any>({});
  const [identityForm, setIdentityForm] = useState<any>({});
  const [empInfoForm, setEmpInfoForm] = useState<any>({});

  // Other documents form
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocForm, setNewDocForm] = useState({ name: "", description: "", filePath: "", fileName: "" });

  // Assets assignment form (TL / Manager only)
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [assetForm, setAssetForm] = useState({
    name: "Laptop",
    description: "",
    serialNumber: "",
    assignedDate: new Date().toISOString().split("T")[0],
    documentPath: "",
    documentName: "",
    status: "Active"
  });

  // Reference for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otherFileInputRef = useRef<HTMLInputElement>(null);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  // Supervisor lists for editing Employee Info (Designation & Reporting To)
  const [supervisors, setSupervisors] = useState<any[]>([]);

  const [policyCompliance, setPolicyCompliance] = useState<any>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [readingPolicy, setReadingPolicy] = useState<any>(null);

  // Reading tracker state for profile nested reader
  const [nestedSeconds, setNestedSeconds] = useState(15);
  const [nestedScroll, setNestedScroll] = useState(0);
  const [nestedViewedDocs, setNestedViewedDocs] = useState<string[]>([]);
  const [nestedAgreed, setNestedAgreed] = useState(false);
  const [nestedSubmitting, setNestedSubmitting] = useState(false);
  const nestedScrollRef = useRef<HTMLDivElement>(null);

  const fetchPolicyCompliance = async () => {
    setPolicyLoading(true);
    try {
      const res = await fetch(`/api/employee-profile/${userId}/policy-compliance`);
      if (res.ok) {
        setPolicyCompliance(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPolicyLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "policy") {
      fetchPolicyCompliance();
    }
  }, [activeTab, userId]);

  useEffect(() => {
    if (!readingPolicy) return;
    setNestedSeconds(15);
    setNestedScroll(0);
    setNestedViewedDocs([]);
    setNestedAgreed(false);

    fetch(`/api/policies/${readingPolicy.id}/acknowledgement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open" })
    });

    const interval = setInterval(() => {
      setNestedSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [readingPolicy]);

  const handleNestedScroll = () => {
    const el = nestedScrollRef.current;
    if (!el) return;
    const totalHeight = el.scrollHeight - el.clientHeight;
    if (totalHeight <= 0) {
      setNestedScroll(100);
      return;
    }
    setNestedScroll((el.scrollTop / totalHeight) * 100);
  };

  const handleNestedViewDoc = async (docName: string, docUrl: string) => {
    if (!nestedViewedDocs.includes(docName)) {
      setNestedViewedDocs(prev => [...prev, docName]);
    }
    try {
      await fetch(`/api/policies/${readingPolicy.id}/acknowledgement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "progress", documentName: docName })
      });
    } catch (e) {
      console.error(e);
    }
    window.open(docUrl, "_blank");
  };

  const handleNestedAccept = async () => {
    if (!nestedAgreed || nestedSubmitting) return;
    setNestedSubmitting(true);
    try {
      const res = await fetch(`/api/policies/${readingPolicy.id}/acknowledgement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" })
      });
      if (res.ok) {
        setReadingPolicy(null);
        fetchPolicyCompliance();
      } else {
        alert("Failed to submit acknowledgement.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNestedSubmitting(false);
    }
  };

  const handleAuditDocDownload = async (policyId: number, documentName: string) => {
    try {
      await fetch(`/api/policies/${policyId}/download-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName })
      });
      fetchPolicyCompliance();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfileData();
    if (role === "boss" || role === "manager" || role === "tl") {
      fetchSupervisorsList();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user + profile
      const res = await fetch(`/api/employee-profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        setIsSelf(data.isSelf || false);
        
        setPersonalForm({
          dob: data.profile.dob || "",
          bloodGroup: data.profile.bloodGroup || "O+",
          fatherName: data.profile.fatherName || "",
          maritalStatus: data.profile.maritalStatus || "Single",
          marriageDate: data.profile.marriageDate || "",
          spouseName: data.profile.spouseName || "",
          nationality: data.profile.nationality || "Indian",
          religion: data.profile.religion || "Hinduism",
          personalEmail: data.profile.personalEmail || "",
          address: data.profile.address || ""
        });

        setIdentityForm({
          aadhaarNumber: data.profile.aadhaarNumber || "",
          panNumber: data.profile.panNumber || "",
          higherEdDocPath: data.profile.higherEdDocPath || "",
          higherEdDocName: data.profile.higherEdDocName || ""
        });

        setEmpInfoForm({
          name: data.user.name || "",
          email: data.user.email || "",
          designation: data.user.designation || "",
          reportingTo: data.user.reportingTo || "",
          employeeId: data.profile.employeeId || "",
          joiningDate: data.profile.joiningDate || "",
          recruiterNumber: data.profile.recruiterNumber || "",
          gender: data.profile.gender || "Male"
        });
      }

      // 2. Fetch assets
      const assetRes = await fetch(`/api/employee-profile/${userId}/assets`);
      if (assetRes.ok) {
        setAssets(await assetRes.json());
      }

      // 3. Fetch custom documents
      const docsRes = await fetch(`/api/employee-profile/${userId}/other-docs`);
      if (docsRes.ok) {
        setOtherDocs(await docsRes.json());
      }

      // 4. Fetch activity timeline
      const timelineRes = await fetch(`/api/employee-profile/${userId}/activity-history`);
      if (timelineRes.ok) {
        setTimeline(await timelineRes.json());
      }

    } catch (err) {
      console.error("Error fetching profile details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisorsList = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const team = await res.json();
        // Supervisors can be TLs, Managers or Boss
        const filtered = team.filter((u: any) => ["boss", "manager", "tl"].includes(u.role) && u.id !== userId);
        setSupervisors(filtered);
      }
    } catch (err) {
      console.error("Error fetching supervisors:", err);
    }
  };

  // Base64 file uploader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "higherEd" | "otherDoc" | "assetDoc") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension rules
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(ext)) {
      alert(`Invalid file type. Allowed formats: ${allowedExtensions.join(", ").toUpperCase()}`);
      return;
    }

    setUploadingDocType(type);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (type === "higherEd") {
            setIdentityForm((prev: any) => ({
              ...prev,
              higherEdDocPath: data.url,
              higherEdDocName: file.name
            }));
            // If not in editing mode, trigger immediate update for higher education documents
            if (!isEditingIdentity) {
              await updateProfile({
                higherEdDocPath: data.url,
                higherEdDocName: file.name
              }, "Identity Details Updated");
            }
          } else if (type === "otherDoc") {
            setNewDocForm((prev: any) => ({
              ...prev,
              filePath: data.url,
              fileName: file.name
            }));
          } else if (type === "assetDoc") {
            setAssetForm((prev: any) => ({
              ...prev,
              documentPath: data.url,
              documentName: file.name
            }));
          }
        } else {
          alert("File upload failed.");
        }
      } catch (err) {
        console.error("File upload error:", err);
        alert("Upload encountered a system error.");
      } finally {
        setUploadingDocType(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async (profileData: any, auditDetail = "Details Updated") => {
    setSaving(true);
    try {
      const res = await fetch(`/api/employee-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData })
      });
      if (res.ok) {
        await fetchProfileData();
      } else {
        const err = await res.json();
        alert(err.error || "Update failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmpInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const profileData = {
        recruiterNumber: empInfoForm.recruiterNumber,
        gender: empInfoForm.gender,
        employeeId: empInfoForm.employeeId,
        joiningDate: empInfoForm.joiningDate
      };
      
      const userData = {
        name: empInfoForm.name,
        email: empInfoForm.email,
        designation: empInfoForm.designation,
        reportingTo: empInfoForm.reportingTo || null
      };

      const res = await fetch(`/api/employee-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData, userData })
      });

      if (res.ok) {
        setIsEditingEmpInfo(false);
        await fetchProfileData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update Employee details.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/employee-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData: personalForm })
      });
      if (res.ok) {
        setIsEditingPersonal(false);
        await fetchProfileData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update Personal info.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/employee-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData: identityForm })
      });
      if (res.ok) {
        setIsEditingIdentity(false);
        await fetchProfileData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update Identity details.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.name || !newDocForm.filePath) {
      alert("Please provide a name and upload a document.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/employee-profile/${userId}/other-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDocForm)
      });
      if (res.ok) {
        setShowAddDocModal(false);
        setNewDocForm({ name: "", description: "", filePath: "", fileName: "" });
        await fetchProfileData();
      } else {
        alert("Failed to add custom document.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm("Are you sure you want to remove this document?")) return;
    try {
      const res = await fetch(`/api/other-docs/${docId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchProfileData();
      } else {
        alert("Failed to remove document.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAssetModal = (asset: any = null) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetForm({
        name: asset.name,
        description: asset.description || "",
        serialNumber: asset.serialNumber,
        assignedDate: asset.assignedDate || new Date().toISOString().split("T")[0],
        documentPath: asset.documentPath || "",
        documentName: asset.documentName || "",
        status: asset.status
      });
    } else {
      setEditingAsset(null);
      setAssetForm({
        name: "Laptop",
        description: "",
        serialNumber: "",
        assignedDate: new Date().toISOString().split("T")[0],
        documentPath: "",
        documentName: "",
        status: "Active"
      });
    }
    setShowAssetModal(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.serialNumber) {
      alert("Serial number is required.");
      return;
    }
    setSaving(true);
    try {
      const method = editingAsset ? "PUT" : "POST";
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : "/api/assets";
      const payload = editingAsset ? assetForm : { ...assetForm, userId };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAssetModal(false);
        await fetchProfileData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to complete asset action.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)", background: "#f8fafc", flexDirection: "column", gap: "15px" }}>
        <LucideLoader2 className="animate-spin" size={40} color="#2563eb" />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#64748b" }}>Loading Profile...</span>
      </div>
    );
  }

  // Permissions summary
  // Boss and Superadmin can edit subordinate or self; Manager and TL can only edit subordinates (not self)
  const canEditEmpInfo = (
    role === "superadmin"
  ) || (
    role === "boss" && ["manager", "tl", "recruiter", "boss"].includes(user?.role)
  ) || (
    role === "manager" && !isSelf && ["tl", "recruiter"].includes(user?.role)
  ) || (
    role === "tl" && !isSelf && ["recruiter"].includes(user?.role)
  );

  const canEditHeaderFields = canEditEmpInfo;
  const isEmpInfoFieldsDisabled = !canEditEmpInfo;

  const canEditPersonal = isSelf || (
    role === "boss" && ["manager", "tl", "recruiter", "boss"].includes(user?.role)
  ) || (
    role === "manager" && ["tl", "recruiter"].includes(user?.role)
  ) || (
    role === "tl" && ["recruiter"].includes(user?.role)
  ) || (
    role === "superadmin"
  );

  // Identity and documents (Aadhaar, PAN, High Ed docs) - Recruiter, Manager, or Boss can edit
  const canEditIdentity = isSelf || (
    role === "boss" && ["manager", "tl", "recruiter", "boss"].includes(user?.role)
  ) || (
    role === "manager" && ["tl", "recruiter"].includes(user?.role)
  ) || (
    role === "superadmin"
  );

  const canManageAssets = (
    role === "boss" && ["manager", "tl", "recruiter"].includes(user?.role)
  ) || (
    role === "manager" && ["tl", "recruiter"].includes(user?.role)
  ) || (
    role === "tl" && ["recruiter"].includes(user?.role)
  );

  return (
    <div className="profile-dashboard-container" style={{ padding: onClose ? "0" : "1.5rem 2rem", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box" }}>
      
      {/* Top Banner and Profile Header Card */}
      <div className="profile-header-card glass-card" style={{ 
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        borderRadius: "24px",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
        padding: "24px 30px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        flexWrap: "wrap",
        position: "relative",
        overflow: "hidden",
        marginBottom: "24px"
      }}>
        {/* Glow decoration */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "rgba(37, 99, 235, 0.04)", borderRadius: "50%", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", bottom: "-50px", left: "-50px", width: "100px", height: "100px", background: "rgba(168, 85, 247, 0.03)", borderRadius: "50%", pointerEvents: "none" }}></div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          {/* Avatar / Photo */}
          <div style={{ position: "relative" }}>
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "20px", 
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 900,
              boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.3)",
              border: "3px solid #ffffff"
            }}>
              {user?.name?.[0] || "U"}
            </div>
            <div style={{ 
              position: "absolute", 
              bottom: "-4px", 
              right: "-4px", 
              background: "#10b981", 
              color: "white", 
              fontSize: "0.6rem", 
              fontWeight: 800, 
              padding: "2px 6px", 
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textTransform: "uppercase"
            }}>
              {user?.role || "Recruiter"}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>{user?.name}</h1>
              <span style={{ fontSize: "0.75rem", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "2px 8px", borderRadius: "6px", fontWeight: 800, color: "#475569" }}>
                {profile?.employeeId || `EMP-${userId}`}
              </span>
            </div>
            
            <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 600, margin: "4px 0 8px 0", display: "flex", alignItems: "center", gap: "6px" }}>
              <LucideBriefcase size={14} color="#2563eb" /> {user?.designation || "Executive Recruiter"}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
              {user?.manager_tl && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <strong>Reporting To:</strong> <span style={{ color: "#0f172a", fontWeight: 700 }}>{user.manager_tl.name}</span>
                </span>
              )}
              {profile?.joiningDate && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <strong>Joining Date:</strong> <span style={{ color: "#0f172a", fontWeight: 700 }}>{profile.joiningDate}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", alignSelf: "flex-start" }}>
          {canEditHeaderFields && !isEditingEmpInfo && (
            <button
              onClick={() => {
                setActiveTab("personal");
                setIsEditingEmpInfo(true);
              }}
              style={{
                background: "rgba(37,99,235,0.08)",
                color: "#2563eb",
                border: "none",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "0.78rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(37,99,235,0.12)"}
              onMouseOut={e => e.currentTarget.style.background = "rgba(37,99,235,0.08)"}
            >
              <LucideEdit size={14} /> Edit Info
            </button>
          )}

          {onClose && (
            <button 
              onClick={onClose}
              style={{ 
                background: "white", 
                border: "1px solid #e2e8f0", 
                width: "36px", 
                height: "36px", 
                borderRadius: "10px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                cursor: "pointer", 
                color: "#64748b",
                transition: "0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = "#cbd5e1"}
              onMouseOut={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            >
              <LucideX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Profile Section Tabs and Form Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "24px", alignItems: "flex-start" }}>
        
        {/* Left Column: Navigation Tabs & Employee Info Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Side Menu Navigation */}
          <div className="profile-side-tabs glass-card" style={{ 
            background: "#ffffff", 
            border: "1px solid rgba(226, 232, 240, 0.8)",
            borderRadius: "20px", 
            padding: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}>
            {[
              { id: "personal", label: "Personal Information", icon: <LucideUser size={16} /> },
              { id: "identity", label: "Identity & Documents", icon: <LucideFingerprint size={16} /> },
              { id: "assets", label: "Corporate Assets", icon: <LucideLaptop size={16} /> },
              { id: "timeline", label: "Activity History", icon: <LucideHistory size={16} /> },
              ...(role !== "boss" && role !== "superadmin" ? [{ id: "policy", label: "Policy Compliance", icon: <LucideShield size={16} /> }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: activeTab === tab.id ? "rgba(37, 99, 235, 0.05)" : "transparent",
                  color: activeTab === tab.id ? "#2563eb" : "#64748b",
                  fontWeight: activeTab === tab.id ? 800 : 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
              >
                <span style={{ color: activeTab === tab.id ? "#2563eb" : "#94a3b8" }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Info Box */}
          <div className="glass-card" style={{ 
            background: "#ffffff", 
            border: "1px solid rgba(226, 232, 240, 0.8)",
            borderRadius: "20px", 
            padding: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Corporate Status</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>Active Duty</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700 }}>COMPANY EMAIL</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", wordBreak: "break-all" }}>{user?.email}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700 }}>RECRUITER NUMBER</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b" }}>{profile?.recruiterNumber || "Not Provided"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Active Tab Workspace */}
        <div className="profile-tab-workspace glass-card" style={{ 
          background: "#ffffff", 
          border: "1px solid rgba(226, 232, 240, 0.8)",
          borderRadius: "24px", 
          padding: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
          minHeight: "450px",
          boxSizing: "border-box"
        }}>
          
          <AnimatePresence mode="wait">
            {activeTab === "personal" && (
              <motion.div
                key="personal-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Personal Information</h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0 0" }}>Update your personal profile, marital status, and contact address.</p>
                  </div>
                  {canEditPersonal && !isEditingPersonal && (
                    <button 
                      onClick={() => setIsEditingPersonal(true)}
                      style={{ 
                        background: "rgba(37,99,235,0.08)", 
                        color: "#2563eb", 
                        border: "none", 
                        padding: "8px 16px", 
                        borderRadius: "10px", 
                        fontSize: "0.78rem", 
                        fontWeight: 800, 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "rgba(37,99,235,0.12)"}
                      onMouseOut={e => e.currentTarget.style.background = "rgba(37,99,235,0.08)"}
                    >
                      <LucideEdit size={14} /> Edit Fields
                    </button>
                  )}
                </div>

                {/* Section 1: Employee Information - Nested inside tab workspace for a streamlined view */}
                <div style={{ border: "1px solid #f1f5f9", background: "#f8fafc", padding: "16px 20px", borderRadius: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Section 1: Employee Information</h3>
                    {(canEditEmpInfo || isSelf) && !isEditingEmpInfo && (
                      <button 
                        onClick={() => setIsEditingEmpInfo(true)}
                        style={{ border: "none", background: "none", color: "#2563eb", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}
                      >
                        {isSelf ? "Modify Details" : "Modify (Supervisor)"}
                      </button>
                    )}
                  </div>

                  {isEditingEmpInfo ? (
                    <form onSubmit={handleSaveEmpInfo} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Employee Name</label>
                        <input className="input-premium" value={empInfoForm.name} onChange={e => setEmpInfoForm({...empInfoForm, name: e.target.value})} required disabled={isEmpInfoFieldsDisabled} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Employee ID Number</label>
                        <input className="input-premium" value={empInfoForm.employeeId} onChange={e => setEmpInfoForm({...empInfoForm, employeeId: e.target.value})} required disabled={isEmpInfoFieldsDisabled} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Designation</label>
                        <input className="input-premium" value={empInfoForm.designation} onChange={e => setEmpInfoForm({...empInfoForm, designation: e.target.value})} required disabled={isEmpInfoFieldsDisabled} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Reporting To</label>
                        <select className="input-premium" style={{ background: "white", height: "38px" }} value={empInfoForm.reportingTo} onChange={e => setEmpInfoForm({...empInfoForm, reportingTo: e.target.value})} disabled={isEmpInfoFieldsDisabled}>
                          <option value="">-- No Direct Supervisor --</option>
                          {supervisors.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.role.toUpperCase()})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Joining Date</label>
                        <input type="date" className="input-premium" value={empInfoForm.joiningDate} onChange={e => setEmpInfoForm({...empInfoForm, joiningDate: e.target.value})} disabled={isEmpInfoFieldsDisabled} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Company Email</label>
                        <input type="email" className="input-premium" value={empInfoForm.email} onChange={e => setEmpInfoForm({...empInfoForm, email: e.target.value})} required disabled={isEmpInfoFieldsDisabled} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Recruiter Number</label>
                        <input className="input-premium" value={empInfoForm.recruiterNumber} onChange={e => setEmpInfoForm({...empInfoForm, recruiterNumber: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Gender</label>
                        <select className="input-premium" style={{ background: "white", height: "38px" }} value={empInfoForm.gender} onChange={e => setEmpInfoForm({...empInfoForm, gender: e.target.value})}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        <button type="button" onClick={() => setIsEditingEmpInfo(false)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.78rem" }}>Cancel</button>
                        <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.78rem", background: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                          <LucideSave size={14} /> {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px 20px", fontSize: "0.85rem" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>FULL NAME</span>
                        <strong style={{ color: "#1e293b" }}>{user?.name}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>RECRUITER NUMBER</span>
                        <strong style={{ color: "#1e293b" }}>{profile?.recruiterNumber || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>None Provided</span>}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>GENDER</span>
                        <strong style={{ color: "#1e293b" }}>{profile?.gender}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>COMPANY EMAIL</span>
                        <strong style={{ color: "#2563eb" }}>{user?.email}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>EMPLOYEE ID</span>
                        <strong style={{ color: "#1e293b" }}>{profile?.employeeId || "N/A"}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>JOINING DATE</span>
                        <strong style={{ color: "#1e293b" }}>{profile?.joiningDate || "N/A"}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>DESIGNATION</span>
                        <strong style={{ color: "#1e293b" }}>{user?.designation || "N/A"}</strong>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>REPORTING TO</span>
                        <strong style={{ color: "#1e293b" }}>{user?.manager_tl?.name || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>None Assigned</span>}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Personal Information Form */}
                <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Section 2: Personal Details</h3>
                {isEditingPersonal ? (
                  <form onSubmit={handleSavePersonal} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Date of Birth</label>
                        <input type="date" className="input-premium" value={personalForm.dob} onChange={e => setPersonalForm({...personalForm, dob: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Blood Group</label>
                        <select className="input-premium" style={{ background: "white", height: "38px" }} value={personalForm.bloodGroup} onChange={e => setPersonalForm({...personalForm, bloodGroup: e.target.value})}>
                          {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Father's Name</label>
                        <input className="input-premium" placeholder="Father's legal name" value={personalForm.fatherName} onChange={e => setPersonalForm({...personalForm, fatherName: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Marital Status</label>
                        <select className="input-premium" style={{ background: "white", height: "38px" }} value={personalForm.maritalStatus} onChange={e => setPersonalForm({...personalForm, maritalStatus: e.target.value})}>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>

                      {/* Conditional Fields based on Marital Status */}
                      {personalForm.maritalStatus === "Married" && (
                        <>
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Marriage Date</label>
                            <input type="date" className="input-premium" value={personalForm.marriageDate} onChange={e => setPersonalForm({...personalForm, marriageDate: e.target.value})} />
                          </motion.div>
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Spouse Name</label>
                            <input className="input-premium" placeholder="Spouse's legal name" value={personalForm.spouseName} onChange={e => setPersonalForm({...personalForm, spouseName: e.target.value})} />
                          </motion.div>
                        </>
                      )}

                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Nationality</label>
                        <input className="input-premium" value={personalForm.nationality} onChange={e => setPersonalForm({...personalForm, nationality: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Religion</label>
                        <input className="input-premium" value={personalForm.religion} onChange={e => setPersonalForm({...personalForm, religion: e.target.value})} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Personal Email</label>
                        <input type="email" className="input-premium" placeholder="username@personal.com" value={personalForm.personalEmail} onChange={e => setPersonalForm({...personalForm, personalEmail: e.target.value})} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Address</label>
                        <textarea className="input-premium" rows={3} style={{ resize: "none" }} placeholder="Complete residential address" value={personalForm.address} onChange={e => setPersonalForm({...personalForm, address: e.target.value})} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button type="button" onClick={() => setIsEditingPersonal(false)} className="btn-secondary" style={{ padding: "8px 16px" }}>Cancel</button>
                      <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "8px 20px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <LucideSave size={14} /> {saving ? "Saving..." : "Save Details"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px 20px", fontSize: "0.85rem" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>DATE OF BIRTH</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.dob || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Added</span>}</strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>BLOOD GROUP</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.bloodGroup || "O+"}</strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>FATHER NAME</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.fatherName || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Added</span>}</strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>MARITAL STATUS</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.maritalStatus || "Single"}</strong>
                    </div>

                    {profile?.maritalStatus === "Married" && (
                      <>
                        <div>
                          <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>MARRIAGE DATE</span>
                          <strong style={{ color: "#1e293b" }}>{profile?.marriageDate || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Added</span>}</strong>
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>SPOUSE NAME</span>
                          <strong style={{ color: "#1e293b" }}>{profile?.spouseName || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Added</span>}</strong>
                        </div>
                      </>
                    )}

                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>NATIONALITY</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.nationality || "Indian"}</strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>RELIGION</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.religion || "Hinduism"}</strong>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>PERSONAL EMAIL</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.personalEmail || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Added</span>}</strong>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>RESIDENTIAL ADDRESS</span>
                      <strong style={{ color: "#1e293b", whiteSpace: "pre-line", lineHeight: 1.4 }}>{profile?.address || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Added</span>}</strong>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "identity" && (
              <motion.div
                key="identity-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Identity & Documents</h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0 0" }}>Manage government identifications, educational documents, and references.</p>
                  </div>
                  {canEditIdentity && !isEditingIdentity && (
                    <button 
                      onClick={() => setIsEditingIdentity(true)}
                      style={{ 
                        background: "rgba(37,99,235,0.08)", 
                        color: "#2563eb", 
                        border: "none", 
                        padding: "8px 16px", 
                        borderRadius: "10px", 
                        fontSize: "0.78rem", 
                        fontWeight: 800, 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "0.2s"
                      }}
                    >
                      <LucideEdit size={14} /> Edit Identity Details
                    </button>
                  )}
                </div>

                {isEditingIdentity ? (
                  <form onSubmit={handleSaveIdentity} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Aadhaar Number</label>
                        <input className="input-premium" placeholder="12 Digit Unique Number" value={identityForm.aadhaarNumber} onChange={e => setIdentityForm({...identityForm, aadhaarNumber: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>PAN Card Number</label>
                        <input className="input-premium" placeholder="10 Digit Alphanumeric" value={identityForm.panNumber} onChange={e => setIdentityForm({...identityForm, panNumber: e.target.value.toUpperCase()})} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button type="button" onClick={() => setIsEditingIdentity(false)} className="btn-secondary" style={{ padding: "8px 16px" }}>Cancel</button>
                      <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "8px 20px" }}>
                        {saving ? "Saving..." : "Save Identity Info"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", fontSize: "0.85rem", marginBottom: "30px" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>AADHAAR NUMBER</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.aadhaarNumber || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Added</span>}</strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", marginBottom: "2px" }}>PAN CARD NUMBER</span>
                      <strong style={{ color: "#1e293b" }}>{profile?.panNumber || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not Added</span>}</strong>
                    </div>
                  </div>
                )}

                <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "24px 0" }} />

                {/* Document Slot 1: Higher Education Marksheet / Degree */}
                <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Section 3: Higher Education Degree / Marksheet</h3>
                <div style={{ 
                  border: "1.5px dashed #cbd5e1", 
                  borderRadius: "16px", 
                  padding: "20px",
                  background: "#f8fafc",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  flexWrap: "wrap",
                  marginBottom: "35px"
                }}>
                  {profile?.higherEdDocPath ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <LucideFileText size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.9rem", color: "#1e293b", display: "block" }}>{profile.higherEdDocName || "Educational_Degree_Marksheet.pdf"}</strong>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Verification Document Uploaded</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f1f5f9", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <LucideFileUp size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.9rem", color: "#64748b", display: "block" }}>No degree file uploaded</strong>
                        <span style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>Formats allowed: PDF, JPG, PNG, DOC, DOCX</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {profile?.higherEdDocPath && (
                      <>
                        <a 
                          href={profile.higherEdDocPath} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-secondary" 
                          style={{ padding: "8px 12px", fontSize: "0.75rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <LucideEye size={12} /> Preview
                        </a>
                        <a 
                          href={profile.higherEdDocPath} 
                          download={profile.higherEdDocName || "degree_marksheet"}
                          className="btn-secondary" 
                          style={{ padding: "8px 12px", fontSize: "0.75rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <LucideDownload size={12} /> Download
                        </a>
                      </>
                    )}

                    {canEditIdentity && (
                      <>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          style={{ display: "none" }} 
                          onChange={(e) => handleFileUpload(e, "higherEd")} 
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingDocType === "higherEd"}
                          className="btn-primary" 
                          style={{ padding: "8px 14px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          {uploadingDocType === "higherEd" ? (
                            <>Uploading...</>
                          ) : (
                            <>
                              <LucideUpload size={12} />
                              {profile?.higherEdDocPath ? "Replace File" : "Upload Document"}
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Custom Documents (Other Documents) */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Other Credentials & Documents</h3>
                  <button 
                    onClick={() => setShowAddDocModal(true)}
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <LucidePlus size={12} /> Add Document
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                  {otherDocs.map(doc => (
                    <div key={doc.id} className="document-card glass" style={{ 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "14px", 
                      padding: "16px",
                      background: "white",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px",
                      position: "relative"
                    }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1e293b", wordBreak: "break-all", paddingRight: "20px" }}>{doc.name}</span>
                          <button 
                            onClick={() => handleDeleteDocument(doc.id)}
                            style={{ 
                              background: "none", 
                              border: "none", 
                              color: "#ef4444", 
                              cursor: "pointer", 
                              padding: "2px",
                              opacity: 0.6,
                              transition: "0.2s"
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = "1"}
                            onMouseOut={e => e.currentTarget.style.opacity = "0.6"}
                          >
                            <LucideTrash2 size={12} />
                          </button>
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "#64748b", margin: 0, lineHeight: 1.3 }}>{doc.description || "No description provided."}</p>
                      </div>

                      <div style={{ display: "flex", gap: "6px", borderTop: "1px solid #f1f5f9", paddingTop: "10px", marginTop: "4px" }}>
                        <a 
                          href={doc.filePath} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontSize: "0.7rem", color: "#2563eb", textDecoration: "none", fontWeight: 700 }}
                        >
                          View
                        </a>
                        <span style={{ color: "#cbd5e1" }}>|</span>
                        <a 
                          href={doc.filePath} 
                          download={doc.fileName || doc.name}
                          style={{ fontSize: "0.7rem", color: "#64748b", textDecoration: "none", fontWeight: 700 }}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}

                  {otherDocs.length === 0 && (
                    <div style={{ 
                      gridColumn: "1 / -1", 
                      textAlign: "center", 
                      padding: "30px 20px", 
                      background: "#f8fafc", 
                      borderRadius: "14px", 
                      color: "#94a3b8",
                      fontSize: "0.8rem",
                      fontStyle: "italic",
                      border: "1px dashed #cbd5e1"
                    }}>
                      No additional documents uploaded yet. Click "Add Document" to store experience letters, passport copies, certs, etc.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "assets" && (
              <motion.div
                key="assets-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Corporate Assets Details</h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0 0" }}>Check laptops, devices, headsets, or other hardware assigned to your employee account.</p>
                  </div>
                  {canManageAssets && (
                    <button 
                      onClick={() => handleOpenAssetModal()}
                      className="btn-primary"
                      style={{ padding: "8px 16px", fontSize: "0.78rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <LucidePlus size={14} strokeWidth={3} /> Add Asset
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {assets.map(asset => (
                    <div key={asset.id} className="asset-card glass-card" style={{ 
                      background: "#ffffff",
                      border: "1.5px solid #f1f5f9",
                      borderRadius: "18px",
                      padding: "20px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.01)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px",
                      position: "relative"
                    }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.68rem", background: "rgba(37,99,235,0.06)", color: "#2563eb", padding: "2px 8px", borderRadius: "6px", fontWeight: 800 }}>
                            {asset.assignedDate}
                          </span>
                          <span style={{ 
                            fontSize: "0.68rem", 
                            background: asset.status === "Active" ? "#ecfdf5" : (asset.status === "Returned" ? "#eff6ff" : (asset.status === "Damaged" ? "#fef2f2" : "#fffbeb")), 
                            color: asset.status === "Active" ? "#065f46" : (asset.status === "Returned" ? "#1e40af" : (asset.status === "Damaged" ? "#991b1b" : "#b45309")), 
                            padding: "2px 8px", 
                            borderRadius: "6px", 
                            fontWeight: 800,
                            border: `1px solid currentColor`
                          }}>
                            {asset.status}
                          </span>
                        </div>

                        <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#1e293b", margin: "6px 0 2px" }}>{asset.name}</h3>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", fontFamily: "monospace", fontWeight: 700, marginBottom: "8px" }}>
                          S/N: {asset.serialNumber}
                        </span>
                        
                        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>{asset.description || "No description provided."}</p>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          {asset.documentPath ? (
                            <a 
                              href={asset.documentPath} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ fontSize: "0.72rem", color: "#2563eb", textDecoration: "none", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <LucideFileText size={12} /> Asset Receipt
                            </a>
                          ) : (
                            <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontStyle: "italic" }}>No document attached</span>
                          )}
                        </div>

                        {canManageAssets && (
                          <button 
                            onClick={() => handleOpenAssetModal(asset)}
                            style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer" }}
                          >
                            Manage Asset
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {assets.length === 0 && (
                    <div style={{ 
                      gridColumn: "1 / -1", 
                      textAlign: "center", 
                      padding: "40px 20px", 
                      background: "#f8fafc", 
                      borderRadius: "20px", 
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      fontStyle: "italic",
                      border: "1px dashed #cbd5e1"
                    }}>
                      No corporate assets assigned to this employee node.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "timeline" && (
              <motion.div
                key="timeline-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Activity & Asset Timeline</h2>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0 0" }}>Chronological history log of profile changes and asset transaction vectors.</p>
                </div>

                <div className="timeline-container" style={{ position: "relative", paddingLeft: "24px", boxSizing: "border-box" }}>
                  {/* Vertical line decoration */}
                  <div style={{ position: "absolute", top: "10px", bottom: "10px", left: "6px", width: "2px", background: "#e2e8f0" }}></div>

                  {timeline.map((event, idx) => (
                    <div key={idx} style={{ position: "relative", marginBottom: "24px" }}>
                      {/* Circle dot */}
                      <div style={{ 
                        position: "absolute", 
                        left: "-23px", 
                        top: "2px", 
                        width: "10px", 
                        height: "10px", 
                        borderRadius: "50%", 
                        background: event.type === "asset" ? "#2563eb" : "#a855f7",
                        border: "2px solid #ffffff",
                        boxShadow: "0 0 0 3px rgba(37,99,235,0.15)"
                      }}></div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                        <div>
                          <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block" }}>{event.title}</strong>
                          <p style={{ fontSize: "0.78rem", color: "#475569", margin: "4px 0", lineHeight: 1.4 }}>{event.details}</p>
                          <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>Action by: {event.performedBy}</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>
                          {new Date(event.createdAt).toLocaleString("en-IN", { 
                            dateStyle: "medium", 
                            timeStyle: "short" 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {timeline.length === 0 && (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "30px 20px", 
                      background: "#f8fafc", 
                      borderRadius: "14px", 
                      color: "#94a3b8",
                      fontSize: "0.8rem",
                      fontStyle: "italic"
                    }}>
                      No events registered in the telemetry timeline.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "policy" && (
              <motion.div
                key="policy-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>Company Policy Compliance Hub</h2>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0 0" }}>Review corporation policies, track acknowledgement status and read guidelines.</p>
                  </div>
                  {policyCompliance && (
                    <div style={{
                      background: policyCompliance.compliancePct === 100 ? "#ecfdf5" : (policyCompliance.compliancePct >= 80 ? "#fffbeb" : "#fef2f2"),
                      color: policyCompliance.compliancePct === 100 ? "#10b981" : (policyCompliance.compliancePct >= 80 ? "#d97706" : "#ef4444"),
                      padding: "8px 16px",
                      borderRadius: "12px",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      border: "1px solid currentColor"
                    }}>
                      Compliance: {policyCompliance.compliancePct}%
                    </div>
                  )}
                </div>

                {policyLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                    <LucideRefreshCw className="spin" size={24} style={{ color: "#2563eb" }} />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    {/* Policy List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {policyCompliance?.policies.map((p: any) => {
                        const statusColor = p.accepted ? "#10b981" : "#ef4444";
                        const severityColor = p.severityLevel === "Critical" ? "#ef4444" : (p.severityLevel === "Mandatory" ? "#f59e0b" : "#3b82f6");

                        return (
                          <div
                            key={p.id}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "16px",
                              padding: "18px",
                              background: "white",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "16px",
                              flexWrap: "wrap"
                            }}
                          >
                            <div style={{ flex: 1, minWidth: "250px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <span style={{
                                  background: `${severityColor}15`,
                                  color: severityColor,
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.68rem",
                                  fontWeight: 800
                                }}>
                                  {p.severityLevel}
                                </span>
                                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                                  v{p.version} | {p.category}
                                </span>
                              </div>
                              <strong style={{ display: "block", fontSize: "0.95rem", color: "#1e293b", marginBottom: "4px" }}>{p.title}</strong>
                              <span style={{ display: "block", fontSize: "0.76rem", color: "#64748b" }}>
                                Assigned By: {p.createdByName} ({p.createdByRole.toUpperCase()})
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                              <div style={{ textAlign: "right" }}>
                                <span style={{
                                  background: `${statusColor}15`,
                                  color: statusColor,
                                  padding: "4px 10px",
                                  borderRadius: "8px",
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  display: "inline-block"
                                }}>
                                  {p.accepted ? "Accepted" : "Pending Acceptance"}
                                </span>
                                {p.accepted && p.acceptedDate && (
                                  <span style={{ display: "block", fontSize: "0.68rem", color: "#94a3b8", marginTop: "2px" }}>
                                    {new Date(p.acceptedDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  onClick={() => setReadingPolicy(p)}
                                  style={{
                                    background: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "8px 14px",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    cursor: "pointer"
                                  }}
                                >
                                  {p.accepted ? "View / Re-Read" : "Read & Accept"}
                                </button>
                                {p.documents?.map((doc: any, dIdx: number) => (
                                  <a
                                    key={dIdx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => handleAuditDocDownload(p.id, doc.name)}
                                    title={`Download: ${doc.name}`}
                                    style={{
                                      background: "#f1f5f9",
                                      color: "#475569",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "8px",
                                      padding: "8px",
                                      display: "flex",
                                      alignItems: "center"
                                    }}
                                  >
                                    <LucideDownload size={14} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {policyCompliance?.policies.length === 0 && (
                        <div style={{
                          textAlign: "center",
                          padding: "40px",
                          background: "#f8fafc",
                          borderRadius: "16px",
                          color: "#94a3b8",
                          fontSize: "0.85rem"
                        }}>
                          No policies assigned to your profile configuration.
                        </div>
                      )}
                    </div>

                    {/* Reading Log History */}
                    {policyCompliance?.history && policyCompliance.history.length > 0 && (
                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                        <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.5px" }}>My Policy Reading Telemetry</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
                          {policyCompliance.history.map((log: any) => (
                            <div key={log.id} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", fontSize: "0.78rem" }}>
                              <span style={{ color: "#475569" }}>{log.details}</span>
                              <span style={{ color: "#94a3b8" }}>{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* MODAL 1: ADD OTHER DOCUMENTS */}
      <AnimatePresence>
        {showAddDocModal && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 100000, backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-card" style={{ width: "420px", background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.1rem", color: "#0f172a" }}>Add Document Record</h3>
                <button onClick={() => setShowAddDocModal(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><LucideX size={18} /></button>
              </div>

              <form onSubmit={handleAddDocument} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Document Name *</label>
                  <input className="input-premium" placeholder="e.g. Experience Letter, Certification, Passport" required value={newDocForm.name} onChange={e => setNewDocForm({...newDocForm, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Description</label>
                  <textarea className="input-premium" rows={3} style={{ resize: "none" }} placeholder="Brief details about the file" value={newDocForm.description} onChange={e => setNewDocForm({...newDocForm, description: e.target.value})} />
                </div>
                
                {/* File selector slot */}
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Upload File *</label>
                  <div style={{ 
                    border: "1.5px dashed #cbd5e1", 
                    borderRadius: "10px", 
                    padding: "16px",
                    background: "#f8fafc",
                    textAlign: "center"
                  }}>
                    {newDocForm.filePath ? (
                      <div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#16a34a", display: "block", marginBottom: "8px" }}>✓ {newDocForm.fileName} Loaded</span>
                        <button type="button" onClick={() => setNewDocForm(prev => ({ ...prev, filePath: "", fileName: "" }))} style={{ border: "none", background: "none", color: "#ef4444", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer" }}>Clear file</button>
                      </div>
                    ) : (
                      <div>
                        <input 
                          type="file" 
                          ref={otherFileInputRef} 
                          style={{ display: "none" }} 
                          onChange={(e) => handleFileUpload(e, "otherDoc")} 
                        />
                        <button 
                          type="button" 
                          disabled={uploadingDocType === "otherDoc"}
                          onClick={() => otherFileInputRef.current?.click()}
                          style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer" }}
                        >
                          {uploadingDocType === "otherDoc" ? "Uploading file..." : "Choose Document File"}
                        </button>
                        <span style={{ display: "block", fontSize: "0.65rem", color: "#94a3b8", marginTop: "6px" }}>PDF, JPG, PNG, DOC, DOCX allowed.</span>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={saving || !newDocForm.filePath} className="btn-primary" style={{ width: "100%", padding: "12px", borderRadius: "10px", fontWeight: 800, fontSize: "0.85rem", marginTop: "8px" }}>
                  {saving ? "Creating record..." : "Save Document Attachment"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ASSIGN / MODIFY CORPORATE ASSET */}
      <AnimatePresence>
        {showAssetModal && (
          <div className="modal-overlay flex-center" style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", zIndex: 100000, backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-card" style={{ width: "450px", background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.1rem", color: "#0f172a" }}>
                  {editingAsset ? "Modify Asset details" : "Assign Corporate Asset"}
                </h3>
                <button onClick={() => setShowAssetModal(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><LucideX size={18} /></button>
              </div>

              <form onSubmit={handleSaveAsset} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Asset Type *</label>
                    <select className="input-premium" style={{ background: "white", height: "38px" }} value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})}>
                      {["Laptop", "Desktop", "Monitor", "Headset", "Mobile", "SIM", "ID Card", "Access Card", "Mouse", "Keyboard", "Any Other Asset"].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Serial Number *</label>
                    <input className="input-premium" placeholder="e.g. LPT-98495-2" required value={assetForm.serialNumber} onChange={e => setAssetForm({...assetForm, serialNumber: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Assigned Date</label>
                    <input type="date" className="input-premium" value={assetForm.assignedDate} onChange={e => setAssetForm({...assetForm, assignedDate: e.target.value})} />
                  </div>
                  
                  {editingAsset && (
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Asset Status</label>
                      <select className="input-premium" style={{ background: "white", height: "38px" }} value={assetForm.status} onChange={e => setAssetForm({...assetForm, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Returned">Returned</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Replaced">Replaced</option>
                      </select>
                    </div>
                  )}

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Description / Notes</label>
                    <textarea className="input-premium" rows={2} style={{ resize: "none" }} placeholder="Condition details, configuration, specs..." value={assetForm.description} onChange={e => setAssetForm({...assetForm, description: e.target.value})} />
                  </div>
                </div>

                {/* Upload Asset Document */}
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Asset Document (e.g. Receipt/Handover Letter)</label>
                  <div style={{ 
                    border: "1.5px dashed #cbd5e1", 
                    borderRadius: "10px", 
                    padding: "12px",
                    background: "#f8fafc",
                    textAlign: "center"
                  }}>
                    {assetForm.documentPath ? (
                      <div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#16a34a", display: "block", marginBottom: "6px" }}>✓ {assetForm.documentName} Attached</span>
                        <button type="button" onClick={() => setAssetForm(prev => ({ ...prev, documentPath: "", documentName: "" }))} style={{ border: "none", background: "none", color: "#ef4444", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer" }}>Remove document</button>
                      </div>
                    ) : (
                      <div>
                        <input 
                          type="file" 
                          ref={assetFileInputRef} 
                          style={{ display: "none" }} 
                          onChange={(e) => handleFileUpload(e, "assetDoc")} 
                        />
                        <button 
                          type="button" 
                          disabled={uploadingDocType === "assetDoc"}
                          onClick={() => assetFileInputRef.current?.click()}
                          style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer" }}
                        >
                          {uploadingDocType === "assetDoc" ? "Uploading file..." : "Upload Asset Slip / Receipt"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary" style={{ width: "100%", padding: "12px", borderRadius: "10px", fontWeight: 800, fontSize: "0.85rem", marginTop: "8px" }}>
                  {saving ? "Saving changes..." : (editingAsset ? "Authorize Updates" : "Allocate Asset to Recruiter")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NESTED MODAL: POLICY READER VIEW & ACCEPTANCE */}
      <AnimatePresence>
        {readingPolicy && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 100005,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
            padding: "20px"
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "white",
                borderRadius: "24px",
                width: "750px",
                maxWidth: "100%",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
                overflow: "hidden"
              }}
            >
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>
                    {readingPolicy.title}
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Version: {readingPolicy.version} | Category: {readingPolicy.category}</span>
                </div>
                <button
                  onClick={() => setReadingPolicy(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                >
                  <LucideX size={20} />
                </button>
              </div>

              <div
                ref={nestedScrollRef}
                onScroll={handleNestedScroll}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px",
                  background: "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ background: "white", padding: "18px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                    {readingPolicy.description || "Please review the documents below."}
                  </p>
                </div>

                {/* Documents */}
                {readingPolicy.documents && readingPolicy.documents.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>Policy Guidelines Documents</h4>
                    {readingPolicy.documents.map((doc: any, dIdx: number) => {
                      const isOpened = nestedViewedDocs.includes(doc.name);
                      return (
                        <div
                          key={dIdx}
                          style={{
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "10px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1e293b" }}>{doc.name}</span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleNestedViewDoc(doc.name, doc.url)}
                              style={{
                                background: isOpened ? "#ecfdf5" : "#eff6ff",
                                color: isOpened ? "#10b981" : "#2563eb",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px 12px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              {isOpened ? "Viewed" : "View"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* If pending, show countdown guidelines */}
                {!readingPolicy.accepted && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    background: "#f1f5f9",
                    padding: "12px",
                    borderRadius: "12px",
                    fontSize: "0.75rem"
                  }}>
                    <div>
                      <span style={{ color: "#64748b" }}>Timer: </span>
                      <strong style={{ color: nestedSeconds === 0 ? "#10b981" : "#ef4444" }}>
                        {nestedSeconds === 0 ? "Ready" : `${nestedSeconds}s remaining`}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Scroll: </span>
                      <strong style={{ color: nestedScroll >= 80 ? "#10b981" : "#ef4444" }}>
                        {Math.round(nestedScroll)}% {nestedScroll >= 80 ? "(Passed)" : "(Scroll to bottom)"}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: "20px 24px",
                borderTop: "1px solid #f1f5f9",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {!readingPolicy.accepted ? (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <input
                        type="checkbox"
                        id="nestedCheck"
                        disabled={nestedSeconds > 0 || (nestedScroll < 80 && (nestedScrollRef.current && nestedScrollRef.current.scrollHeight > nestedScrollRef.current.clientHeight + 10))}
                        checked={nestedAgreed}
                        onChange={(e) => setNestedAgreed(e.target.checked)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <label htmlFor="nestedCheck" style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 700, cursor: "pointer" }}>
                        I have read, understood and agree to comply with this policy.
                      </label>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button
                        onClick={() => setReadingPolicy(null)}
                        style={{
                          background: "white",
                          color: "#475569",
                          border: "1px solid #cbd5e1",
                          borderRadius: "10px",
                          padding: "10px 18px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleNestedAccept}
                        disabled={!nestedAgreed || nestedSubmitting}
                        style={{
                          background: nestedAgreed && !nestedSubmitting ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "#cbd5e1",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          padding: "10px 24px",
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          cursor: nestedAgreed && !nestedSubmitting ? "pointer" : "not-allowed"
                        }}
                      >
                        {nestedSubmitting ? "Submitting..." : "Agree & Accept"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setReadingPolicy(null)}
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "none",
                        borderRadius: "10px",
                        padding: "10px 24px",
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        cursor: "pointer"
                      }}
                    >
                      Close Viewer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
