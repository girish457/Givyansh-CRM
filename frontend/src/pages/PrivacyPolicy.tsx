import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <div className="policy-page" style={{ padding: "120px 20px 80px", maxWidth: "850px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: "900", color: "#0c2854", marginBottom: "30px" }}>Privacy Policy</h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "40px" }}>Last Updated: March 25, 2026</p>

          <section style={{ marginBottom: "50px" }}>
            <h2 style={{ fontSize: "1.8rem", color: "#0c2854", marginBottom: "20px" }}>1. Data Collection</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "15px" }}>
              Givyansh CRM collect only the most essential telemetry required to maintain your neural recruitment nodes. 
              This includes encrypted credential hashes, session identifiers, and organizational hierarchy maps.
            </p>
          </section>

          <section style={{ marginBottom: "50px" }}>
            <h2 style={{ fontSize: "1.8rem", color: "#0c2854", marginBottom: "20px" }}>2. Neural Security</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "15px" }}>
              All data is processed through our AES-256 encrypted gateway. We do not sell your candidate data to 
              third-party networks. Your recruitment logic remains uniquely pinned to your agency's instance.
            </p>
          </section>

          <section style={{ marginBottom: "50px" }}>
            <h2 style={{ fontSize: "1.8rem", color: "#0c2854", marginBottom: "20px" }}>3. Cookies & Analytics</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "15px" }}>
              We use clinical-grade session cookies to ensure low-latency authentication. These are purged automatically 
              upon session expiration or explicit neural logouts.
            </p>
          </section>

          <div style={{ marginTop: "80px", padding: "30px", background: "#f8faff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
             <p style={{ color: "#64748b", fontSize: "0.95rem", textAlign: "center", fontWeight: "700" }}>
               For further inquiries regarding data sovereignty, please contact our Legal Hub.
             </p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
