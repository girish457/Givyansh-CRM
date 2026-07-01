import { useState, useEffect } from "react";
import {
  LucideUser, LucideBuilding2, LucideMail, LucidePhone, LucideMapPin,
  LucideFileText, LucideEdit3, LucideSave, LucideX, LucideLock,
  LucideGlobe, LucideCalendar, LucidePercent, LucideCheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Field = ({ label, value, icon }: any) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ color: "#cbd5e1" }}>{icon}</span>{label}
    </span>
    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>{value || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not provided</span>}</span>
  </div>
);

export default function VendorProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Password change
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/vendor/profile", {
        headers: { "Authorization": `VendorBearer ${localStorage.getItem("vendor_token") || ""}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setForm({ ownerName: data.ownerName || "", altPhone: data.altPhone || "", website: data.website || "", city: data.city || "", state: data.state || "", country: data.country || "India", gstNo: data.gstNo || "", panNo: data.panNo || "", bankDetails: data.bankDetails || "", notes: data.notes || "" });
      }
    } catch (err) {
      console.error("Failed to load vendor profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `VendorBearer ${localStorage.getItem("vendor_token") || ""}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.vendor);
        setEditing(false);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdMsg("New passwords do not match.");
      return;
    }
    try {
      const res = await fetch("/api/vendor/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `VendorBearer ${localStorage.getItem("vendor_token") || ""}`
        },
        body: JSON.stringify({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMsg("Password changed successfully!");
        setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
        setTimeout(() => { setPwdMsg(""); setShowPwdForm(false); }, 2000);
      } else {
        setPwdMsg(data.error || "Failed to change password.");
      }
    } catch (err) {
      setPwdMsg("Network error.");
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading profile...</div>;

  const p = profile || {};
  const initials = (p.name || "V").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: "28px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Success message */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "10px 16px", borderRadius: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
            <LucideCheckCircle2 size={16} /> {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Hero */}
      <div style={{ background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", padding: "32px 36px", display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white", fontSize: "2rem", flexShrink: 0, boxShadow: "0 12px 28px rgba(124,58,237,0.4)" }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "white", margin: "0 0 4px" }}>{p.name}</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", margin: "0 0 8px" }}>{p.company}</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {p.vendorCode && <span style={{ background: "rgba(96,165,250,0.2)", border: "1px solid rgba(96,165,250,0.4)", color: "#60a5fa", padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>{p.vendorCode}</span>}
              <span style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>● ACTIVE</span>
              {p.type && <span style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc", padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>{p.type}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {!editing && (
              <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                <LucideEdit3 size={14} /> Edit Profile
              </button>
            )}
            <button onClick={() => setShowPwdForm(!showPwdForm)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
              <LucideLock size={14} /> Change Password
            </button>
          </div>
        </div>

        {/* Info Grid */}
        {!editing ? (
          <div style={{ padding: "28px 36px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            <Field label="Vendor Name" value={p.name} icon={<LucideUser size={11} />} />
            <Field label="Vendor Code" value={p.vendorCode} icon={<LucideFileText size={11} />} />
            <Field label="Company Name" value={p.company} icon={<LucideBuilding2 size={11} />} />
            <Field label="Owner Name" value={p.ownerName} icon={<LucideUser size={11} />} />
            <Field label="Email" value={p.email} icon={<LucideMail size={11} />} />
            <Field label="Phone" value={p.phone} icon={<LucidePhone size={11} />} />
            <Field label="Alternate Phone" value={p.altPhone} icon={<LucidePhone size={11} />} />
            <Field label="City" value={p.city} icon={<LucideMapPin size={11} />} />
            <Field label="State" value={p.state} icon={<LucideMapPin size={11} />} />
            <Field label="Country" value={p.country} icon={<LucideGlobe size={11} />} />
            <Field label="Website" value={p.website} icon={<LucideGlobe size={11} />} />
            <Field label="GST No" value={p.gstNo} icon={<LucideFileText size={11} />} />
            <Field label="PAN No" value={p.panNo} icon={<LucideFileText size={11} />} />
            <Field label="Contract Start" value={p.contractStart} icon={<LucideCalendar size={11} />} />
            <Field label="Contract End" value={p.contractEnd} icon={<LucideCalendar size={11} />} />
            <Field label="Commission Rate" value={p.commissionRate ? `${p.commissionRate}%` : undefined} icon={<LucidePercent size={11} />} />
            <div style={{ gridColumn: "span 3" }}>
              <Field label="Bank Details" value={p.bankDetails} icon={<LucideFileText size={11} />} />
            </div>
            <div style={{ gridColumn: "span 3" }}>
              <Field label="Notes" value={p.notes} icon={<LucideFileText size={11} />} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ padding: "28px 36px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
              {[
                { key: "ownerName", label: "Owner Name", type: "text" },
                { key: "altPhone", label: "Alternate Phone", type: "tel" },
                { key: "website", label: "Website", type: "url" },
                { key: "city", label: "City", type: "text" },
                { key: "state", label: "State", type: "text" },
                { key: "country", label: "Country", type: "text" },
                { key: "gstNo", label: "GST No", type: "text" },
                { key: "panNo", label: "PAN No", type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { key: "bankDetails", label: "Bank Details" },
                { key: "notes", label: "Notes" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>{f.label}</label>
                  <textarea value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} rows={2} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setEditing(false)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                <LucideX size={14} /> Cancel
              </button>
              <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "9px", border: "none", background: "#2563eb", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                <LucideSave size={14} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <AnimatePresence>
        {showPwdForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <LucideLock size={18} color="#2563eb" /> Change Password
            </h3>
            {pwdMsg && <div style={{ padding: "10px", background: pwdMsg.includes("success") ? "#f0fdf4" : "#fef2f2", borderRadius: "8px", marginBottom: "12px", color: pwdMsg.includes("success") ? "#15803d" : "#dc2626", fontSize: "0.82rem", fontWeight: 600 }}>{pwdMsg}</div>}
            <form onSubmit={handlePasswordChange} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {[
                { key: "currentPassword", label: "Current Password" },
                { key: "newPassword", label: "New Password" },
                { key: "confirm", label: "Confirm New Password" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>{f.label}</label>
                  <input type="password" value={(pwdForm as any)[f.key]} onChange={e => setPwdForm({ ...pwdForm, [f.key]: e.target.value })} required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ gridColumn: "span 3", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowPwdForm(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "9px 18px", borderRadius: "9px", border: "none", background: "#7c3aed", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Update Password</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
