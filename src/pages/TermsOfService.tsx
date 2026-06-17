import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <MainLayout>
      <div className="policy-page" style={{ padding: "120px 20px 80px", maxWidth: "850px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: "900", color: "#0c2854", marginBottom: "30px" }}>Terms of Service</h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "40px" }}>Effective Date: March 25, 2026</p>

          <section style={{ marginBottom: "50px" }}>
            <h2 style={{ fontSize: "1.8rem", color: "#0c2854", marginBottom: "20px" }}>1. Service Activation</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "15px" }}>
              Access to Givyansh CRM requires an active organization license. You agree to use the 
              neural recruitment tools only for legitimate business hiring. 
              Unauthorized reverse engineering or scraping of our sorting algorithms is strictly prohibited.
            </p>
          </section>

          <section style={{ marginBottom: "50px" }}>
            <h2 style={{ fontSize: "1.8rem", color: "#0c2854", marginBottom: "20px" }}>2. Data Rights</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "15px" }}>
              Givyansh CRM provides the infrastructure, but you own all candidate data. 
              We are not liable for data loss occurring via external breaches on the client side.
            </p>
          </section>

          <section style={{ marginBottom: "50px" }}>
            <h2 style={{ fontSize: "1.8rem", color: "#0c2854", marginBottom: "20px" }}>3. Termination</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "15px" }}>
              We reserve the right to suspend any recruitment nodes that exhibit malicious or 
              excessively high-latency behaviors that threaten system stability.
            </p>
          </section>

          <div style={{ marginTop: "80px", padding: "30px", background: "#fdfdf1", borderRadius: "16px", border: "1px solid #fef3c7" }}>
             <p style={{ color: "#92400e", fontSize: "0.95rem", textAlign: "center", fontWeight: "700" }}>
               Full Terms of Service govern your relationship with Givyansh CRM Inc. and the Givyansh ecosystem.
             </p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
