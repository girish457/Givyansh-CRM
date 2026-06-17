import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  LucideArrowLeft, LucideClock, LucideCalendar, 
  LucideUser, LucideShare2, LucideBookmark,
  LucideTrendingUp, LucideCpu, LucideLayers,
  LucideQuote
} from "lucide-react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { blogPosts, BlogPostType } from "./BlogData";
import "@/styles/Pages.css";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function BlogPost() {
  const { id } = useParams();
  
  // Find the post by ID
  const post = blogPosts.find((p) => p.id === id);

  // Fallback if post not found
  if (!post) {
    return <Navigate to="/blogs" />;
  }

  return (
    <MainLayout className="blog-post-page-v2">
      {/* 1. ARTICLE HEADER */}
      <section style={{ padding: "80px 0 60px", background: "white" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
             <Link to="/blogs" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#64748b", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem", marginBottom: "30px", background: "#f1f5f9", padding: "8px 20px", borderRadius: "100px" }}>
                <LucideArrowLeft size={16} /> BACK TO JOURNAL
             </Link>
             
             <div style={{ display: "flex", alignItems: "center", gap: "10px", color: post.color, fontWeight: "900", letterSpacing: "0.2em", fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "15px" }}>
                {post.icon} {post.subtitle}
             </div>
             
             <h1 style={{ fontSize: "3.5rem", fontWeight: "900", color: "#0c2854", lineHeight: 1.1, marginBottom: "30px", letterSpacing: "-0.02em" }}>
               {post.title}
             </h1>
             
             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "30px", borderBottom: "1px solid #f1f5f9", marginBottom: "40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                   <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#2563eb" }}>G</div>
                   <div>
                      <p style={{ fontSize: "0.95rem", fontWeight: "900", color: "#0c2854" }}>{post.author}</p>
                      <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>{post.date} • {post.readTime}</p>
                   </div>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                   <button style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><LucideShare2 size={20} /></button>
                   <button style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><LucideBookmark size={20} /></button>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ARTICLE COVER IMAGE */}
      <section style={{ padding: "0 0 80px" }}>
        <div className="container" style={{ maxWidth: "1100px" }}>
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             style={{ 
               width: "100%", 
               height: "550px", 
               borderRadius: "48px", 
               background: `url(${post.image})`, 
               backgroundSize: "cover", 
               backgroundPosition: "center", 
               boxShadow: "0 40px 100px rgba(0,0,0,0.1)"
             }} 
           />
        </div>
      </section>

      {/* 3. BODY CONTENT */}
      <section style={{ paddingBottom: "120px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
           <div className="article-body" style={{ fontSize: "1.2rem", color: "#334155", lineHeight: 1.8, fontWeight: "500" }}>
              <p style={{ marginBottom: "30px" }}>
                {post.content}
              </p>
              
              <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "#0c2854", marginTop: "60px", marginBottom: "25px" }}>
                The Neural Advantage
              </h2>
              
              <p style={{ marginBottom: "30px" }}>
                Data isolation is no longer just a security requirement; it's a performance strategy. 
                By architecting Givyansh on a multi-tenant, isolated database model, we ensure that team 
                nodes can operate at full speed without cross-query latency. This is the bedrock of 
                high-velocity scaling.
              </p>
              
              <div style={{ background: "#f8faff", padding: "40px", borderRadius: "32px", borderLeft: "8px solid #10b981", margin: "60px 0" }}>
                 <LucideQuote size={40} color="#10b981" style={{ marginBottom: "20px", opacity: 0.5 }} />
                 <p style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0c2854", lineHeight: 1.4, fontStyle: "italic" }}>
                   "True scaling isn't about adding more recruiters; it's about removing the friction 
                   between data entry and strategic decision-making."
                 </p>
                 <p style={{ marginTop: "20px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", fontSize: "0.85rem" }}>— Givyansh Engineering Lead</p>
              </div>

              <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "#0c2854", marginTop: "60px", marginBottom: "25px" }}>
                Implementation Strategy
              </h2>
              
              <p style={{ marginBottom: "30px" }}>
                Manual resume sorting is the single greatest bottleneck in modern recruitment. Our latest 
                update introduces proprietary neural filters that map candidate experience patterns 
                against firm-specific historical success data. This results in a 400% increase in 
                shortlisting velocity.
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", margin: "60px 0" }}>
                 <div style={{ background: "#f0f7ff", padding: "30px", borderRadius: "24px", border: "1px solid #e0f2fe" }}>
                    <LucideCpu size={32} color="#2563eb" style={{ marginBottom: "15px" }} />
                    <h4 style={{ fontWeight: "900", color: "#0c2854", fontSize: "1.1rem" }}>Zero-Latency Processing</h4>
                 </div>
                 <div style={{ background: "#f0fdf4", padding: "30px", borderRadius: "24px", border: "1px solid #dcfce7" }}>
                    <LucideLayers size={32} color="#10b981" style={{ marginBottom: "15px" }} />
                    <h4 style={{ fontWeight: "900", color: "#0c2854", fontSize: "1.1rem" }}>Secure Data Inversion</h4>
                 </div>
              </div>

              <p style={{ marginBottom: "30px" }}>
                As we move into 2026, the firms that embrace this automated hierarchy will not only 
                survive but fundamentally redefine the cost-per-hire metrics that governed the 
                industry for the last fifty years.
              </p>
           </div>
        </div>
      </section>
    </MainLayout>
  );
}
