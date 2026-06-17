import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { 
  LucideLock, 
  LucideMail, 
  LucideLoader2, 
  LucideCheckCircle2, 
  LucideArrowRight,
  LucideGlobe,
  LucideCheckCircle,
  LucideStar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/Pages.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server offline / non-JSON response received.");
      }

      if (res.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user?.role === "superadmin") navigate("/superadmin");
        else navigate(`/dashboard/${data.user?.role}`);
      } else {
        setError(data.error || "Access Denied: Invalid Credentials");
      }
    } catch (err) {
      setError("Sync Error: Neural uplink failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout className="login-page-manatal">
      <section style={{ 
        height: "100vh", 
        display: "flex", 
        background: "#ffffff",
        overflow: "hidden"
      }}>
        
        {/* LEFT PANEL: PRODUCT SHOWCASE */}
        <div style={{ 
          flex: 1, 
          background: "#2563eb", 
          padding: "30px 40px", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "space-between",
          color: "white",
          position: "relative"
        }} className="desktop-only">
           <div style={{ textAlign: "center", marginTop: "15px" }}>
              <h1 style={{ fontSize: "2.2rem", fontWeight: "900", lineHeight: 1.1, marginBottom: "12px" }}>
                Transform <br/> the way you recruit.
              </h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ 
                  marginTop: "20px", 
                  width: "80%", 
                  maxWidth: "450px", 
                  background: "rgba(255,255,255,0.1)", 
                  padding: "10px", 
                  borderRadius: "14px",
                  backdropFilter: "blur(5px)",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.2)"
                }}
              >
                 <div style={{ background: "white", borderRadius: "8px", overflow: "hidden" }}>
                    <img 
                      src="/images/product_mockup.png" 
                      alt="Givyansh Dashboard" 
                      style={{ width: "100%", height: "auto", display: "block" }} 
                    />
                 </div>
              </motion.div>
           </div>

           {/* Brand Grid */}
           <div style={{ width: "100%", textAlign: "center", marginBottom: "25px" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: "800", opacity: 0.8, marginBottom: "15px", textTransform: "uppercase", letterSpacing: "0.1em" }}>You'll be in good company</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "25px", opacity: 0.7, fontWeight: "900", fontSize: "1rem" }}>
                 <span>TOYOTA</span>
                 <span>KPMG</span>
                 <span>HEINEKEN</span>
                 <span>KELLY</span>
                 <span>GOOGLE</span>
              </div>
              
              <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "15px" }}>
                 <p style={{ fontSize: "0.75rem", fontWeight: "800", opacity: 0.9, marginBottom: "10px" }}>Loved by 1,200+ recruitment teams worldwide</p>
                 <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                    {[1,2,3,4,5].map(i => <LucideStar key={i} size={12} fill="white" color="white" />)}
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT PANEL: AUTHENTICATION */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "100px 40px 20px" }}>
           <div style={{ width: "100%", maxWidth: "400px" }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                 <img 
                   src="/images/givyansh_logo.png" 
                   alt="Givyansh CRM" 
                   style={{ width: "200px", height: "auto", marginBottom: "12px" }} 
                 />
                 <h2 style={{ fontSize: "0.95rem", color: "#2563eb", fontWeight: "700" }}>Start your neural recruitment journey.</h2>
                 <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>Login to access your centralized node.</p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ 
                      background: "#fef2f2", 
                      border: "1px solid #fee2e2", 
                      color: "#dc2626", 
                      padding: "10px 15px", 
                      borderRadius: "8px", 
                      fontSize: "0.85rem", 
                      fontWeight: "700",
                      marginBottom: "15px",
                      textAlign: "center"
                    }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                 <div style={{ position: "relative" }}>
                    <input 
                      type="email" 
                      placeholder="Company Email Address *" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      style={{ width: "100%", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.95rem" }} 
                    />
                 </div>
                 
                 <div style={{ position: "relative" }}>
                    <input 
                      type="password" 
                      placeholder="Security Password *" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      style={{ width: "100%", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.95rem" }} 
                    />
                 </div>

                 <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "5px 0" }}>
                   By signing in, I agree to the <Link to="#" style={{ color: "#2563eb" }}>Privacy Policy</Link> and <Link to="#" style={{ color: "#2563eb" }}>Terms</Link>
                 </p>

                 <motion.button 
                   whileHover={{ background: "#1e40af" }}
                   whileTap={{ scale: 0.98 }}
                   type="submit" 
                   disabled={loading}
                   style={{ 
                     background: "#2563eb", 
                     color: "white", 
                     border: "none", 
                     padding: "14px", 
                     borderRadius: "8px", 
                     fontWeight: "900", 
                     cursor: "pointer", 
                     marginTop: "5px",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     gap: "10px"
                   }}
                 >
                   {loading ? <LucideLoader2 className="animate-spin" /> : <>SIGN IN <LucideArrowRight size={18} /></>}
                 </motion.button>

                 <div style={{ textAlign: "center", margin: "15px 0", position: "relative" }}>
                    <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />
                    <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", padding: "0 10px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "900" }}>OR</span>
                 </div>

                 <button type="button" style={{ 
                    padding: "14px", 
                    borderRadius: "8px", 
                    border: "1px solid #e2e8f0", 
                    background: "white", 
                    fontWeight: "700", 
                    color: "#475569", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "10px", 
                    cursor: "pointer" 
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                 </button>

                 <div style={{ textAlign: "center", marginTop: "30px" }}>
                    <p style={{ fontSize: "0.95rem", color: "#475569" }}>
                      Already have an account? <Link to="#" style={{ color: "#2563eb", fontWeight: "900", textDecoration: "none" }}>Sign In</Link>
                    </p>
                 </div>
              </form>
           </div>
        </div>

      </section>
    </MainLayout>
  );
}
