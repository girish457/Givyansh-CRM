import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  LucideMail, LucidePhone, LucideMapPin, LucideSend, 
  LucideMessageCircle, LucideGlobe2, LucideArrowUpRight,
  LucideZap, LucideShieldCheck, LucideClock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/Pages.css";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Contact() {
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting Givyansh Signal Transmission...", formData);
    
    if (!formData.email || !formData.message) {
      alert("Please provide at least a work email and narrative.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/public/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          subject: "Inquiry from Givyansh Portfolio",
          message: formData.message
        })
      });

      if (res.ok) {
        console.log("Transmission Successful.");
        setShowSuccess(true);
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const errData = await res.json();
        console.error("Transmission Error:", errData);
        alert("Transmission failed: " + (errData.error || "Unknown response"));
      }
    } catch (err) {
      console.error("Uplink failure:", err);
      alert("Network failure: Could not reach Givyansh Hub.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <MainLayout className="contact-page-v2">
      {/* 1. HERO & CONTACT SPLIT */}
      <section style={{ padding: "80px 0 40px", background: "white", position: "relative", overflow: "hidden" }}>
        {/* Background Accents */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 0 }} />

        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
               <motion.span variants={fadeInUp} style={{ color: "#2563eb", fontWeight: "900", letterSpacing: "0.2em", fontSize: "0.85rem", textTransform: "uppercase" }}>COMMUNICATIONS HUB</motion.span>
               <motion.h1 variants={fadeInUp} style={{ fontSize: "4rem", fontWeight: "900", color: "#0c2854", marginTop: "15px", letterSpacing: "-0.02em" }}>
                 Let’s scale your <span style={{ color: "#10b981" }}>Success.</span>
               </motion.h1>
               <motion.p variants={fadeInUp} style={{ fontSize: "1.2rem", color: "#64748b", maxWidth: "700px", margin: "20px auto 0", lineHeight: 1.6 }}>
                 Have questions about our neural recruitment ecosystem? Our global response team 
                 is standing by to assist your scaling journey.
               </motion.p>
            </motion.div>
          </div>

          <div style={{ display: "flex", gap: "80px", alignItems: "flex-start" }}>
            
            {/* LEFT: THE CONTACT PRISM */}
            <div style={{ flex: 1 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* 1. Email Card */}
                <motion.div variants={fadeInUp} style={{ background: "#f0f7ff", padding: "20px", borderRadius: "20px", border: "1px solid #e0f2fe", boxShadow: "0 15px 40px rgba(0,0,0,0.04)", display: "flex", gap: "20px", alignItems: "center" }}>
                   <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "white", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 15px rgba(37, 99, 235, 0.1)" }}>
                     <LucideMail size={22} />
                   </div>
                   <div>
                     <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0c2854", marginBottom: "2px" }}>Email Support</h4>
                     <p style={{ color: "#64748b", fontSize: "0.9rem" }}>hello@givyanshcrm.com</p>
                   </div>
                </motion.div>

                {/* 2. Global Labs Card */}
                <motion.div variants={fadeInUp} style={{ background: "#f0fdf4", padding: "20px", borderRadius: "20px", border: "1px solid #dcfce7", boxShadow: "0 15px 40px rgba(0,0,0,0.04)", display: "flex", gap: "20px", alignItems: "center" }}>
                   <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "white", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 15px rgba(16, 185, 129, 0.1)" }}>
                     <LucideGlobe2 size={22} />
                   </div>
                   <div>
                     <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0c2854", marginBottom: "2px" }}>Global Labs</h4>
                     <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Mumbai Tech Hub | Singapore Operations</p>
                   </div>
                </motion.div>

                {/* 3. Fast-Track Card */}
                <motion.div variants={fadeInUp} style={{ background: "#fff7ed", padding: "20px", borderRadius: "20px", border: "1px solid #ffedd5", boxShadow: "0 15px 40px rgba(0,0,0,0.04)", display: "flex", gap: "20px", alignItems: "center" }}>
                   <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "white", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 15px rgba(245, 158, 11, 0.1)" }}>
                     <LucideZap size={22} />
                   </div>
                   <div>
                     <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0c2854", marginBottom: "2px" }}>Quick Response</h4>
                     <p style={{ color: "#64748b", fontSize: "0.9rem" }}>SLA: <span style={{ fontWeight: 800 }}>&lt; 2 Hours</span> for enterprise.</p>
                   </div>
                </motion.div>

                {/* Live Tracking Accent */}
                <motion.div variants={fadeInUp} style={{ marginTop: "20px", padding: "20px 30px", background: "#f8fafc", borderRadius: "20px", display: "flex", alignItems: "center", gap: "15px", border: "1px solid #e2e8f0" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                  <span style={{ fontSize: "0.9rem", color: "#475569", fontWeight: "700" }}>All systems operational in 4 locations</span>
                </motion.div>

              </motion.div>
            </div>

            {/* RIGHT: THE INTAKE HUB (FORM) */}
            <div style={{ flex: 1.2 }}>
              <motion.div 
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.8 }}
                style={{ 
                  background: "#f8faff", 
                  padding: "35px", 
                  borderRadius: "32px", 
                  boxShadow: "0 40px 100px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0",
                  position: "relative"
                }}
              >
                {/* Form Heading Inside */}
                <div style={{ marginBottom: "25px" }}>
                   <h3 style={{ fontSize: "1.6rem", fontWeight: "900", color: "#0c2854", marginBottom: "8px" }}>Submit Inquiry</h3>
                   <p style={{ color: "#64748b", fontWeight: "500", fontSize: "0.95rem" }}>Our neural system will route your message to the correct lab.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div className="form-group-v3">
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "#0c2854", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>First Name</label>
                      <input 
                        type="text" 
                        placeholder="Aarav" 
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        style={{ width: "100%", padding: "16px 20px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "1rem" }} 
                      />
                    </div>
                    <div className="form-group-v3">
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "#0c2854", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Name</label>
                      <input 
                        type="text" 
                        placeholder="Saxena" 
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        style={{ width: "100%", padding: "16px 20px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "1rem" }} 
                      />
                    </div>
                  </div>

                  <div className="form-group-v3">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "#0c2854", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Work Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="ceo@company.com" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: "100%", padding: "16px 20px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "1rem" }} 
                    />
                  </div>

                  <div className="form-group-v3">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "#0c2854", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project Narrative</label>
                    <textarea 
                      required
                      placeholder="Briefly describe your agency's scaling goals..." 
                      rows={4} 
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      style={{ width: "100%", padding: "16px 20px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "1rem", resize: "none" }} 
                    />
                  </div>

                  <motion.button 
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      marginTop: "20px",
                      background: isSubmitting ? "#94a3b8" : "#2563eb", 
                      color: "white", 
                      padding: "20px", 
                      borderRadius: "16px", 
                      fontWeight: "900", 
                      fontSize: "1.1rem",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: "12px",
                      boxShadow: "0 20px 40px rgba(37, 99, 235, 0.25)",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      border: "none"
                    }}
                  >
                    {isSubmitting ? "Transmitting..." : "Transmit Inquiry"} <LucideSend size={20} />
                  </motion.button>
                </form>

                {/* Secure Badge */}
                <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", color: "#94a3b8" }}>
                  <LucideShieldCheck size={18} />
                  <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>Secured by Givyansh Encryption Hub</span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FAQ MINI SECTION */}
      <section style={{ padding: "40px 0", background: "#f8fafc" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px" }}>
           <div style={{ textAlign: "center", padding: "30px" }}>
              <LucideClock size={32} color="#2563eb" style={{ marginBottom: "15px" }} />
              <h5 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#0c2854", marginBottom: "10px" }}>Response Time</h5>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Our average response time for new inquiries is 1.4 hours.</p>
           </div>
           <div style={{ textAlign: "center", padding: "30px" }}>
              <LucideGlobe2 size={32} color="#10b981" style={{ marginBottom: "15px" }} />
              <h5 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#0c2854", marginBottom: "10px" }}>Global Availability</h5>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>24/7 Monitoring for all Givyansh enterprise nodes.</p>
           </div>
           <div style={{ textAlign: "center", padding: "30px" }}>
              <LucideShieldCheck size={32} color="#f59e0b" style={{ marginBottom: "15px" }} />
              <h5 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#0c2854", marginBottom: "10px" }}>Security First</h5>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Data handled with military-grade transport encryption.</p>
           </div>
        </div>
      </section>
      {/* SUCCESS NOTIFICATION POPUP */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            style={{
              position: "fixed",
              top: "40px",
              right: "40px",
              background: "white",
              padding: "20px 30px",
              borderRadius: "20px",
              boxShadow: "0 15px 50px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              zIndex: 10000,
              border: "1px solid #dcfce7"
            }}
          >
            <div style={{ width: "40px", height: "40px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
              <LucideShieldCheck size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: "800", color: "#0c2854", fontSize: "0.95rem" }}>Query raised successfully!</p>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.8rem" }}>Signal transmitted to Givyansh Command Hub.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </MainLayout>
  );
}
