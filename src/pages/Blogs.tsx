import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { LucideBookOpen, LucideArrowRight, LucideClock, LucideTrendingUp, LucideCpu, LucideLayers, LucideMail, LucideSend } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { blogPosts } from "./BlogData";
import "@/styles/Pages.css";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const secondaryPosts = blogPosts.slice(1);
const masterPost = blogPosts[0];

export default function Blogs() {
  return (
    <MainLayout className="blogs-page-v2">
      {/* 1. BLOGS HERO */}
      <section style={{ padding: "80px 0 60px", background: "white", position: "relative", overflow: "hidden" }}>
        {/* Abstract Accents */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
        
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
               <motion.span variants={fadeInUp} style={{ color: "#2563eb", fontWeight: "900", letterSpacing: "0.25em", fontSize: "0.85rem", textTransform: "uppercase" }}>NEURAL INSIGHTS HUB</motion.span>
               <motion.h1 variants={fadeInUp} style={{ fontSize: "4.2rem", fontWeight: "900", color: "#0c2854", marginTop: "15px", letterSpacing: "-0.03em" }}>
                 The Givyansh <span style={{ color: "#10b981" }}>Journal.</span>
               </motion.h1>
               <motion.p variants={fadeInUp} style={{ fontSize: "1.25rem", color: "#64748b", maxWidth: "700px", margin: "25px auto 0", lineHeight: 1.6 }}>
                 Proprietary strategies and technological breakthroughs engineering the next 
                 generation of high-velocity recruitment agencies.
               </motion.p>
            </motion.div>
          </div>

          {/* 2. THE MASTER POST (FEATURED) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ 
              background: "white", 
              borderRadius: "48px", 
              overflow: "hidden", 
              boxShadow: "0 40px 100px rgba(0,0,0,0.07)",
              border: "1px solid #f1f5f9",
              display: "flex",
              marginBottom: "80px",
              minHeight: "450px"
            }}
          >
            {/* Visual Side */}
            <div style={{ flex: 1, background: `url(${masterPost.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
               <div style={{ position: "absolute", top: "30px", left: "30px", background: "#10b981", color: "white", padding: "8px 20px", borderRadius: "100px", fontWeight: "900", fontSize: "0.75rem", letterSpacing: "0.05em", boxShadow: "0 10px 20px rgba(16,185,129,0.3)" }}>NEWEST INSIGHT</div>
            </div>
            
            {/* Content Side */}
            <div style={{ flex: 1.2, padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
               <div style={{ display: "flex", alignItems: "center", gap: "10px", color: `${masterPost.color}`, fontWeight: "900", textTransform: "uppercase", fontSize: "0.85rem", marginBottom: "20px" }}>
                  {masterPost.icon} {masterPost.subtitle}
               </div>
               <h2 style={{ fontSize: "2.8rem", fontWeight: "900", color: "#0c2854", lineHeight: 1.1, marginBottom: "25px" }}>
                 {masterPost.title}
               </h2>
               <p style={{ fontSize: "1.15rem", color: "#64748b", lineHeight: 1.7, marginBottom: "40px", maxWidth: "500px" }}>
                 {masterPost.desc}
               </p>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                     <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#2563eb" }}>G</div>
                     <div>
                        <p style={{ fontSize: "0.9rem", fontWeight: "900", color: "#0c2854" }}>{masterPost.author}</p>
                        <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>{masterPost.date} • {masterPost.readTime}</p>
                     </div>
                  </div>
                  <Link to={`/blog/${masterPost.id}`} style={{ display: "flex", alignItems: "center", gap: "10px", color: "#10b981", fontWeight: "900", textDecoration: "none", fontSize: "1.1rem" }}>
                     READ POST <LucideArrowRight size={20} />
                  </Link>
               </div>
            </div>
          </motion.div>

          {/* 3. SECONDARY INSIGHTS GRID */}
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
            {secondaryPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                style={{ 
                  background: "white", 
                  padding: "35px", 
                  borderRadius: "32px", 
                  border: "1px solid #f1f5f9", 
                  boxShadow: "0 15px 50px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.4s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "10px", color: post.color, fontWeight: "900", fontSize: "0.8rem", textTransform: "uppercase" }}>
                      {post.icon} {post.category}
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>
                      <LucideClock size={14} /> {post.readTime}
                   </div>
                </div>
                
                <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#0c2854", marginBottom: "15px", lineHeight: 1.3 }}>{post.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "30px", flex: 1 }}>{post.desc}</p>
                
                <div style={{ paddingTop: "25px", borderTop: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "700" }}>{post.date}</span>
                   <Link to={`/blog/${post.id}`} style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: "6px", fontWeight: "900", fontSize: "0.95rem", textDecoration: "none" }}>
                      OPEN POST <LucideArrowRight size={16} />
                   </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. EXECUTIVE BRIEFING NEWSLETTER */}
      <section style={{ padding: "80px 0 120px", background: "white" }}>
        <div className="container">
          <div style={{ 
            background: "#f8faff", 
            borderRadius: "40px", 
            padding: "60px 80px", 
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "60px",
            position: "relative",
            overflow: "hidden"
          }}>
             {/* Accent Decoration */}
             <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(16,185,129,0.03)" }} />

             <div style={{ flex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", color: "#10b981", marginBottom: "15px" }}>
                   <LucideMail size={24} /> <span style={{ fontWeight: "900", letterSpacing: "0.1em", fontSize: "0.8rem", textTransform: "uppercase" }}>EXECUTIVE BRIEFING</span>
                </div>
                <h2 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#0c2854", marginBottom: "15px" }}>Stay ahead of <span style={{ color: "#2563eb" }}>Automation.</span></h2>
                <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: "500", maxWidth: "500px" }}>Join 1,200+ agency directors receiving proprietary recruitment technology insights weekly.</p>
             </div>

             <div style={{ flex: 0.8 }}>
                <div style={{ position: "relative" }}>
                   <input 
                     type="email" 
                     placeholder="Enter your executive email" 
                     style={{ 
                       width: "100%", 
                       padding: "24px 30px", 
                       borderRadius: "20px", 
                       border: "1px solid #e2e8f0", 
                       fontSize: "1rem", 
                       background: "white",
                       fontWeight: "600",
                       boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
                     }} 
                   />
                   <motion.button 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     style={{ 
                       position: "absolute", 
                       right: "10px", 
                       top: "10px", 
                       bottom: "10px", 
                       background: "#2563eb", 
                       color: "white", 
                       border: "none", 
                       padding: "0 30px", 
                       borderRadius: "14px", 
                       fontWeight: "900", 
                       display: "flex", 
                       alignItems: "center", 
                       gap: "10px",
                       cursor: "pointer",
                       boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)"
                     }}
                   >
                     SUBSCRIBE <LucideSend size={18} />
                   </motion.button>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "15px", textAlign: "center", fontWeight: "700" }}>Secured by neural encryption. Zero spam infrastructure.</p>
             </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
