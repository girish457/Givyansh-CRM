import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  LucideLayers, LucideUsers, LucideShieldCheck, 
  LucideTrendingUp, LucideZap, LucideGlobe, 
  LucideArrowUpRight, LucideCpu, LucideDatabase,
  LucideNetwork, LucideSettings2
} from "lucide-react";
import { motion } from "framer-motion";
import "@/styles/Pages.css";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const ecosystemItems = [
  { 
    icon: <LucideLayers size={28} />, 
    title: "Team Hierarchy", 
    desc: "Automate your reporting structure from MD down to Trainee Recruiters with cascading permissions.", 
    color: "#2563eb",
    bg: "#f0f7ff"
  },
  { 
    icon: <LucideUsers size={28} />, 
    title: "Candidate AI Engine", 
    desc: "Manage mass resume processing with centralized neural sorting and instant matching capabilities.", 
    color: "#10b981",
    bg: "#f0fdf4"
  },
  { 
    icon: <LucideShieldCheck size={28} />, 
    title: "Isolated Infrastructure", 
    desc: "Military-grade data isolation ensuring your company's tenant remains private and secure globally.", 
    color: "#f59e0b",
    bg: "#fff7ed"
  },
  { 
    icon: <LucideTrendingUp size={28} />, 
    title: "Real-time Metrics", 
    desc: "Every call, every interview, and every deal synced across the firm in a split second.", 
    color: "#ec4899",
    bg: "#fdf2f8"
  },
  { 
    icon: <LucideZap size={28} />, 
    title: "High Velocity Logic", 
    desc: "Engineered for speed with zero-latency database clusters for your most intense hiring seasons.", 
    color: "#0ea5e9",
    bg: "#f0f9ff"
  },
  { 
    icon: <LucideGlobe size={28} />, 
    title: "Global Compliance", 
    desc: "Stay globally compliant with distributed database regions and cross-border recruitment privacy.", 
    color: "#8b5cf6",
    bg: "#f5f3ff"
  },
];

export default function Services() {
  return (
    <MainLayout className="services-page-v2">
      {/* 1. SERVICES HERO */}
      <section style={{ padding: "80px 0 100px", background: "white", position: "relative", overflow: "hidden" }}>
        {/* Soft Background Accents */}
        <div style={{ position: "absolute", top: "-150px", left: "-150px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 0 }} />
        
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
               <motion.span variants={fadeInUp} style={{ color: "#2563eb", fontWeight: "900", letterSpacing: "0.25em", fontSize: "0.85rem", textTransform: "uppercase" }}>NEURAL OPERATIONS</motion.span>
               <motion.h1 variants={fadeInUp} style={{ fontSize: "4.2rem", fontWeight: "900", color: "#0c2854", marginTop: "15px", letterSpacing: "-0.03em", lineHeight: 1 }}>
                 The Givyansh <span style={{ color: "#10b981" }}>Ecosystem.</span>
               </motion.h1>
               <motion.p variants={fadeInUp} style={{ fontSize: "1.25rem", color: "#64748b", maxWidth: "750px", margin: "25px auto 0", lineHeight: 1.6 }}>
                 Engineered for elite recruitment agencies that demand ultimate stability, 
                 lightning speed, and comprehensive data visualization.
               </motion.p>
            </motion.div>
          </div>

          {/* 2. CORE SERVICES GRID */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "30px",
              maxWidth: "1200px",
              margin: "0 auto"
            }}
          >
            {ecosystemItems.map((s, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -10, boxShadow: "0 25px 60px rgba(0,0,0,0.08)" }}
                style={{ 
                  background: s.bg, 
                  padding: "40px", 
                  borderRadius: "32px", 
                  border: `1px solid rgba(0,0,0,0.02)`,
                  position: "relative",
                  transition: "all 0.4s ease",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "20px"
                }}
              >
                {/* Visual Accent */}
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: s.color, opacity: 0.04 }} />

                <div style={{ 
                  width: "64px", 
                  height: "64px", 
                  borderRadius: "18px", 
                  background: "white", 
                  color: s.color, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  boxShadow: `0 10px 25px rgba(0,0,0,0.05)`,
                  zIndex: 2
                }}>
                  {s.icon}
                </div>
                
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0c2854", marginBottom: "12px" }}>{s.title}</h3>
                  <p style={{ fontSize: "0.95rem", color: "#64748b", lineHeight: 1.6, fontWeight: "500" }}>{s.desc}</p>
                </div>
                
                {/* Interactive Status Indicator */}
                <div style={{ marginTop: "auto", paddingTop: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: `0 0 10px #10b981` }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>OPERATIONAL</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. TECHNICAL DEEP-DIVE / INTEGRATION SECTION */}
      <section style={{ padding: "0 0 120px", background: "white" }}>
        <div className="container">
          <div style={{ 
            background: "linear-gradient(135deg, #0c2854 0%, #061730 100%)", 
            borderRadius: "48px", 
            padding: "80px", 
            position: "relative", 
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.15)"
          }}>
            {/* Dark Mode Visual Accents */}
            <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(37,99,235,0.1)", filter: "blur(60px)" }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: "80px" }}>
              <div style={{ flex: 1.2 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.08)", color: "#0ea5e9", padding: "6px 16px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: "900", marginBottom: "25px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <LucideSettings2 size={16} /> ENTERPRISE API CONNECTIVITY
                </div>
                <h2 style={{ fontSize: "3rem", fontWeight: "900", color: "white", lineHeight: 1.1, marginBottom: "25px" }}>
                   Integrate our intelligence <br/>into your <span style={{ color: "#10b981" }}>legacy stack.</span>
                </h2>
                <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.7)", marginBottom: "40px", lineHeight: 1.7 }}>
                  Our highly-available REST infrastructure allows you to bridge Givyansh 
                  directly with your existing legacy systems, ensuring a seamless data 
                  migration and persistent neural mapping across your entire operation.
                </p>
                
                <div style={{ display: "flex", gap: "15px" }}>
                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "18px 36px", background: "#10b981", color: "white", borderRadius: "16px", border: "none", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 15px 30px rgba(16,185,129,0.3)" }}>
                      Request API Access <LucideArrowUpRight size={20} />
                   </motion.button>
                   <motion.button whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.95 }} style={{ padding: "18px 36px", background: "transparent", color: "white", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)", fontWeight: "900", cursor: "pointer" }}>
                      System Architecture
                   </motion.button>
                </div>
              </div>

              <div style={{ flex: 0.8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                 <div style={{ background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                    <LucideCpu size={36} color="#0ea5e9" style={{ marginBottom: "15px" }} />
                    <h4 style={{ color: "white", fontWeight: "900" }}>99.9% Up</h4>
                 </div>
                 <div style={{ background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                    <LucideDatabase size={36} color="#10b981" style={{ marginBottom: "15px" }} />
                    <h4 style={{ color: "white", fontWeight: "900" }}>Relational</h4>
                 </div>
                 <div style={{ background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                    <LucideNetwork size={36} color="#f59e0b" style={{ marginBottom: "15px" }} />
                    <h4 style={{ color: "white", fontWeight: "900" }}>Restful</h4>
                 </div>
                 <div style={{ background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                    <LucideSettings2 size={36} color="#ec4899" style={{ marginBottom: "15px" }} />
                    <h4 style={{ color: "white", fontWeight: "900" }}>Webhooks</h4>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
