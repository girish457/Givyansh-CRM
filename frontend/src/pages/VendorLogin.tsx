import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LucideLoader2, LucideArrowRight, LucideMail, LucidePhone,
  LucideLock, LucideBuilding2, LucideShield, LucideCheckCircle2,
  LucideTrendingUp, LucideUsers, LucideBriefcase, LucideEye, LucideEyeOff
} from "lucide-react";

export default function VendorLogin() {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState<"email" | "mobile">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      let data: any = {};
      const ct = res.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server offline or non-JSON response.");
      }

      if (res.ok) {
        if (data.token) {
          localStorage.setItem("vendor_token", data.token);
          localStorage.setItem("vendor_data", JSON.stringify(data.vendor));
        }
        navigate("/vendor/dashboard");
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <LucideTrendingUp size={18} />, text: "Track candidate submissions in real-time" },
    { icon: <LucideBriefcase size={18} />, text: "View assigned job requirements" },
    { icon: <LucideUsers size={18} />, text: "Monitor selection & joining ratios" },
    { icon: <LucideShield size={18} />, text: "Secure, role-based access portal" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "#ffffff",
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: "hidden"
    }}>

      {/* LEFT PANEL — Brand Showcase */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden"
      }} className="desktop-only">

        {/* Background Pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)",
          pointerEvents: "none"
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(59,130,246,0.4)",
              fontSize: "1.2rem", fontWeight: 900, color: "white"
            }}>G</div>
            <div>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "white" }}>Givyansh CRM</span>
              <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Vendor Portal</span>
            </div>
          </div>

          <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "white", lineHeight: 1.15, marginBottom: "16px", letterSpacing: "-1px" }}>
            Your Recruitment<br />
            <span style={{ color: "#60a5fa" }}>Partner Hub</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", lineHeight: 1.6, maxWidth: "380px" }}>
            Submit candidates, track your submissions, and measure your performance — all in one place.
          </p>

          <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.85)", fontSize: "0.875rem", fontWeight: 500
                }}
              >
                <span style={{ color: "#60a5fa" }}>{f.icon}</span>
                {f.text}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "20px" }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
            Vendor accounts are created by authorized managers only.<br />
            Contact your recruitment partner for access.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Auth Form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px 40px",
        background: "#fafafa"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: "420px" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", boxShadow: "0 12px 28px rgba(29,78,216,0.3)"
            }}>
              <LucideBuilding2 size={28} color="white" />
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Vendor Sign In
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
              Access your recruitment partner portal
            </p>
          </div>

          {/* Login Mode Toggle */}
          <div style={{
            display: "flex", background: "#f1f5f9", padding: "4px",
            borderRadius: "12px", marginBottom: "24px", border: "1px solid #e2e8f0"
          }}>
            {(["email", "mobile"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setLoginMode(mode); setIdentifier(""); }}
                style={{
                  flex: 1, padding: "9px", borderRadius: "8px", border: "none",
                  background: loginMode === mode ? "white" : "transparent",
                  color: loginMode === mode ? "#1d4ed8" : "#64748b",
                  fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                  boxShadow: loginMode === mode ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                }}
              >
                {mode === "email" ? <LucideMail size={14} /> : <LucidePhone size={14} />}
                {mode === "email" ? "Email" : "Mobile"}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: "#fef2f2", border: "1px solid #fee2e2",
                  color: "#dc2626", padding: "12px 16px", borderRadius: "10px",
                  fontSize: "0.85rem", fontWeight: 600, marginBottom: "16px", textAlign: "center"
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Identifier */}
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {loginMode === "email" ? "Email Address" : "Mobile Number"}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  {loginMode === "email" ? <LucideMail size={16} /> : <LucidePhone size={16} />}
                </span>
                <input
                  type={loginMode === "email" ? "email" : "tel"}
                  placeholder={loginMode === "email" ? "vendor@company.com" : "Enter mobile number"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "13px 14px 13px 42px",
                    borderRadius: "10px", border: "1.5px solid #e2e8f0",
                    fontSize: "0.95rem", outline: "none", background: "white",
                    boxSizing: "border-box", transition: "border-color 0.2s",
                    color: "#0f172a"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#1d4ed8"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <LucideLock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "13px 44px 13px 42px",
                    borderRadius: "10px", border: "1.5px solid #e2e8f0",
                    fontSize: "0.95rem", outline: "none", background: "white",
                    boxSizing: "border-box", transition: "border-color 0.2s",
                    color: "#0f172a"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#1d4ed8"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                >
                  {showPassword ? <LucideEyeOff size={16} /> : <LucideEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01, filter: "brightness(1.05)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                color: "white", border: "none", borderRadius: "10px",
                fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                marginTop: "4px", opacity: loading ? 0.8 : 1,
                boxShadow: "0 6px 20px rgba(29,78,216,0.3)"
              }}
            >
              {loading ? <LucideLoader2 className="animate-spin" size={20} /> : <>Sign In to Vendor Portal <LucideArrowRight size={18} /></>}
            </motion.button>
          </form>

          {/* Footer Info */}
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5 }}>
              🔒 Secure access — vendor accounts are provisioned by your recruitment team only.
            </p>
            <div style={{ marginTop: "12px" }}>
              <Link to="/login" style={{ color: "#2563eb", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>
                ← Back to Staff Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
