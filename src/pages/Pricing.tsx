import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  LucideCheckCircle2, LucideZap, LucideUsers,
  LucideShieldCheck, LucideArrowUpRight, LucideInfo,
  LucideHelpCircle, LucideLock, LucideMonitorCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/Pages.css";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearlyDiscount, setYearlyDiscount] = useState(20);

  useEffect(() => {
    // 1. Fetch Plans
    fetch("http://localhost:5000/api/pricing")
      .then(res => res.json())
      .then(data => {
        setPlans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load plans", err);
        setPlans([]);
        setLoading(false);
      });

    // 2. Fetch Discount Setting
    fetch("http://localhost:5000/api/settings/yearly_discount")
      .then(res => res.json())
      .then(data => {
        if (data && data.value) setYearlyDiscount(parseInt(data.value));
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  if (loading) return (
    <MainLayout>
      <div className="flex-center" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%" }} />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout className="pricing-page-v2">
      {/* 1. PRICING HERO */}
      <section style={{ padding: "80px 0 100px", background: "white", position: "relative", overflow: "hidden" }}>
        {/* Abstract Background Accents */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />

        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.span variants={fadeInUp} style={{ color: "#2563eb", fontWeight: "900", letterSpacing: "0.2em", fontSize: "0.85rem", textTransform: "uppercase" }}>PRICING INFRASTRUCTURE</motion.span>
              <motion.h1 variants={fadeInUp} style={{ fontSize: "4.2rem", fontWeight: "900", color: "#0c2854", marginTop: "15px", letterSpacing: "-0.03em" }}>
                Investment in <span style={{ color: "#10b981" }}>Scaling.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} style={{ fontSize: "1.25rem", color: "#64748b", maxWidth: "600px", margin: "25px auto 0", lineHeight: 1.6 }}>
                Flexible neural plans engineered to match your firm's current velocity.
                Upgrade your ecosystem as you scale.
              </motion.p>
            </motion.div>
          </div>

          {/* 2. BILLING TOGGLE */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "60px" }}>
            <div style={{ background: "#f1f5f9", padding: "6px", borderRadius: "100px", display: "flex", gap: "5px", border: "1px solid #e2e8f0" }}>
              <button
                onClick={() => setIsAnnual(false)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "100px",
                  border: "none",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                  background: !isAnnual ? "#ffffff" : "transparent",
                  color: !isAnnual ? "#0c2854" : "#64748b",
                  boxShadow: !isAnnual ? "0 4px 10px rgba(0,0,0,0.05)" : "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "100px",
                  border: "none",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                  background: isAnnual ? "#ffffff" : "transparent",
                  color: isAnnual ? "#0c2854" : "#64748b",
                  boxShadow: isAnnual ? "0 4px 10px rgba(0,0,0,0.05)" : "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex", alignItems: "center", gap: "8px"
                }}
              >
                Yearly <span style={{ background: "#dcfce7", color: "#10b981", fontSize: "0.7rem", padding: "2px 8px", borderRadius: "100px" }}>-{yearlyDiscount}%</span>
              </button>
            </div>
          </div>

          {/* 3. PRICING GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px", maxWidth: "1200px", margin: "0 auto" }}>
            {Array.isArray(plans) && plans.slice(0, 3).map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                style={{
                  background: plan.isNeuralChoice ? "#0c2854" : "white",
                  padding: "45px 35px",
                  borderRadius: "32px",
                  border: plan.isNeuralChoice ? "none" : "1px solid #f1f5f9",
                  boxShadow: plan.isNeuralChoice ? "0 40px 100px rgba(12, 40, 84, 0.25)" : "0 15px 50px rgba(0,0,0,0.03)",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  zIndex: plan.isNeuralChoice ? 5 : 1
                }}
              >
                {plan.isNeuralChoice && (
                  <div style={{ position: "absolute", top: "20px", right: "20px", background: "#10b981", color: "white", padding: "5px 12px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: "900", letterSpacing: "0.05em" }}>
                    NEURAL CHOICE
                  </div>
                )}

                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: plan.isNeuralChoice ? "rgba(255,255,255,0.1)" : "#f0f7ff", color: plan.isNeuralChoice ? "#10b981" : "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                  {plan.title?.toLowerCase().includes("business") ? <LucideZap size={24} /> : plan.title?.toLowerCase().includes("enterprise") ? <LucideShieldCheck size={24} /> : <LucideUsers size={24} />}
                </div>

                <h3 style={{ fontSize: "1.6rem", fontWeight: "900", color: plan.isNeuralChoice ? "white" : "#0c2854", marginBottom: "10px" }}>{plan.title}</h3>

                <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", marginBottom: "15px" }}>
                  <span style={{ fontSize: isNaN(parseInt(plan.price)) ? "2.2rem" : "3.5rem", fontWeight: "900", color: plan.isNeuralChoice ? "white" : "#0c2854", lineHeight: 1 }}>
                    {isNaN(parseInt(plan.price)) ? plan.price : `$${isAnnual ? Math.floor(parseInt(plan.price) * (1 - yearlyDiscount / 100)) : plan.price}`}
                  </span>
                  {!isNaN(parseInt(plan.price)) && <span style={{ color: plan.isNeuralChoice ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>/mo</span>}
                </div>

                <p style={{ color: plan.isNeuralChoice ? "rgba(255,255,255,0.7)" : "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "25px" }}>{plan.description}</p>

                <div style={{ height: "1px", width: "100%", background: plan.isNeuralChoice ? "rgba(255,255,255,0.1)" : "#f1f5f9", marginBottom: "25px" }} />

                {/* SAFELY PARSE FEATURES */}
                {(() => {
                  let fList = [];
                  try {
                    fList = typeof plan.features === "string" ? JSON.parse(plan.features) : (Array.isArray(plan.features) ? plan.features : []);
                  } catch (e) {
                    fList = Array.isArray(plan.features) ? plan.features : [];
                  }

                  return (
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 35px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
                      {fList.map((f: string, i: number) => (
                        <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", color: plan.isNeuralChoice ? "white" : "#475569", fontSize: "0.9rem", fontWeight: "600" }}>
                          <LucideCheckCircle2 size={18} color="#10b981" /> {f}
                        </li>
                      ))}
                    </ul>
                  );
                })()}

                <Link to="/contact" style={{
                  marginTop: "auto",
                  padding: "18px",
                  borderRadius: "16px",
                  background: plan.isNeuralChoice ? "#10b981" : "white",
                  color: plan.isNeuralChoice ? "white" : "#0c2854",
                  fontWeight: "900",
                  textAlign: "center",
                  fontSize: "1rem",
                  textDecoration: "none",
                  border: plan.isNeuralChoice ? "none" : "2px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                }}>
                  Deploy Solution <LucideArrowUpRight size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRUST & SECURITY MINI SEC */}
      <section style={{ padding: "60px 0", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center", gap: "50px", flexWrap: "wrap", opacity: 0.7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "800", fontSize: "0.85rem" }}>
            <LucideLock size={20} /> SOC2 COMPLIANT HUB
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "800", fontSize: "0.85rem" }}>
            <LucideShieldCheck size={20} /> ISO 27001 SECURED
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "800", fontSize: "0.85rem" }}>
            <LucideMonitorCheck size={20} /> 99.9% NETWORK UPTIME
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "800", fontSize: "0.85rem" }}>
            <LucideHelpCircle size={20} /> 24/7 NEURAL SUPPORT
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
