import React, { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  LucideUsers, LucideTarget, LucideZap, LucideShieldCheck,
  LucideTrendingUp, LucideMessageSquare, LucideGlobe2,
  LucideArrowUpRight, LucideSmile
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import "@/styles/Pages.css";

// 1. Animated Number Component
const AnimatedNumber = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Clean value (extract numbers)
  const numericStr = value.replace(/[^0-9.]/g, '');
  const prefix = value.match(/^[^0-9.]*/)?.[0] || '';
  const suffix = value.match(/[^0-9.]*$/)?.[0] || '';
  const numValue = parseFloat(numericStr) || 0;

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(numValue);
    }
  }, [isInView, numValue, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString(undefined, {
          maximumFractionDigits: numericStr.includes('.') ? 1 : 0
        })}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix, numericStr]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: any = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// --- JOURNEY MILESTONE CARD (STATIC) ---
const MilestoneCard = ({ step }: { step: any }) => {
    return (
        <div style={{ position: "relative", zIndex: 10 }}>
            {/* Card Body - SOLID WHITE */}
            <div style={{ 
                background: "#ffffff", padding: "12px", borderRadius: "24px", 
                boxShadow: "0 25px 50px rgba(0,0,0,0.06)", border: "1px solid #eeeeee",
                position: "relative", zIndex: 12
            }}>
                <div style={{ 
                    width: "100%", height: "200px", borderRadius: "16px", 
                    overflow: "hidden", marginBottom: "20px" 
                }}>
                    <img 
                        src={step.img} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
                        alt={step.year} 
                    />
                </div>
                
                <div style={{ padding: "0 10px 15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0c2854" }}>{step.year}</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: "900", background: "rgba(37,99,235,0.08)", color: "#2563eb", padding: "4px 12px", borderRadius: "100px", letterSpacing: "0.05em" }}>{step.tag}</span>
                    </div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1a1a1a" }}>{step.title}</h4>
                </div>
            </div>

            {/* Solid Primary Dot */}
            <div 
              style={{ 
                width: "22px", height: "22px", borderRadius: "50%", 
                background: "#2563eb",
                border: "4px solid #fff", 
                boxShadow: "0 0 15px rgba(37,99,235,0.3)",
                margin: "40px auto 0", position: "relative", zIndex: 11
              }}
            />
        </div>
    );
};

// --- JOURNEY TIMELINE (STATIC GRID) ---
const JourneyTimeline = () => {
    const steps = [
        { year: "2021", tag: "GENESIS", title: "Mumbai Tech Lab", img: "/images/recruitment_speed_card_1774428205421.png" },
        { year: "2022", tag: "SCALING", title: "100k+ Milestone", img: "/images/recruitment_scaling_card_1774428267739.png" },
        { year: "2023", tag: "GLOBAL", title: "Singapore Expansion", img: "/images/recruitment_community_card_new_1774428287131.png" },
        { year: "2024", tag: "NEURAL", title: "v4.0 AI Launch", img: "/images/recruitment_people_card_1774428243663.png" }
    ];

    return (
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px", position: "relative" }}>
            {/* The Static Timeline Line */}
            <div style={{ position: "absolute", top: "72%", left: "5%", right: "5%", height: "2px", background: "#f1f1f1", zIndex: 0 }} />
            <div 
              style={{ 
                position: "absolute", top: "72%", left: "5%", width: "93%", 
                height: "2px", background: "#2563eb", zIndex: 1,
              }} 
            />

            {steps.map((step) => (
                <MilestoneCard key={step.year} step={step} />
            ))}
        </div>
    );
};

export default function About() {
  const [statsBg, setStatsBg] = useState("#0ea5e9"); // Initial Sky Blue (Sky 500)

  const handleStatsHover = () => {
    const colors = [
      "#0ea5e9", // Sky Blue
      "#0891b2", // Cyan
      "#0c2854", // Navy
      "#16a34a", // Green
      "#4f46e5", // Indigo
      "#d946ef", // Fuchsia
      "#f43f5e", // Rose
      "#fbbf24", // Amber
    ];
    // Pick a new color that is different from current
    const available = colors.filter(c => c !== statsBg);
    const randomColor = available[0 || Math.floor(Math.random() * available.length)];
    setStatsBg(randomColor);
  };

  return (
    <MainLayout className="about-page-v2">
      {/* 1. HERO SECTION */}
      <section style={{ position: "relative", padding: "60px 0 80px", background: "white", overflow: "hidden" }}>
        {/* Abstract Background Shapes */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 0 }} />

        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 1000 }}>
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} style={{ display: "inline-flex", background: "#f0f7ff", color: "#2563eb", padding: "10px 20px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: "800", marginBottom: "30px", border: "1px solid rgba(37,99,235,0.1)" }}>
              <LucideGlobe2 size={16} style={{ marginRight: "8px" }} /> OUR GLOBAL VISION
            </motion.div>

            <motion.h1 variants={fadeInUp} style={{ fontSize: "5rem", fontWeight: "900", color: "#0c2854", lineHeight: 1, marginBottom: "30px", letterSpacing: "-0.03em" }}>
              The World's Fastest <span style={{ color: "#2563eb", display: "inline-block" }}>RMS Platform</span>
            </motion.h1>

            <motion.p variants={fadeInUp} style={{ fontSize: "1.35rem", color: "#4b5563", maxWidth: "800px", margin: "0 auto 50px", lineHeight: 1.6, fontWeight: "500" }}>
              Founded on the belief that talent management should be as fast as thought itself.
              We're redefining recruitment efficiency through cutting-edge architecture.
            </motion.p>

            <motion.div variants={fadeInUp} style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <Link to="/contact" className="hero-btn-v2 main-blue" style={{ background: "#2563eb", color: "white", padding: "18px 40px", borderRadius: "16px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "10px", boxShadow: "0 20px 40px rgba(37,99,235,0.25)" }}>
                Start your journey <LucideArrowUpRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section style={{ padding: "0 0 30px", background: "white" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onMouseEnter={handleStatsHover}
            style={{
              background: statsBg,
              borderRadius: "32px",
              padding: "50px",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              textAlign: "center",
              boxShadow: "0 40px 100px rgba(0,0,0,0.15)",
              transition: "background 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {[
              { val: "2,500+", label: "Active Recruiters" },
              { val: "₹50Cr+", label: "Hiring Managed" },
              { val: "99.9%", label: "Uptime SLA" },
              { val: "24/7", label: "Expert Support" }
            ].map((stat, i) => (
              <div key={stat.label} style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                <h2 style={{ color: "white", fontSize: "2.8rem", fontWeight: "900", marginBottom: "8px" }}>
                  <AnimatedNumber value={stat.val} />
                </h2>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <section style={{ padding: "40px 0 20px", background: "#f8fafc" }}>
        <div className="container" style={{ maxWidth: "1250px" }}>
          <div style={{ textAlign: "center", marginBottom: "65px" }}>
            <h2 style={{ fontSize: "3rem", fontWeight: "900", color: "#1a1a1a", marginBottom: "20px" }}>Our Core <span style={{ color: "#16a34a" }}>Values</span></h2>
            <p style={{ color: "#666", fontSize: "1.1rem", fontWeight: 500 }}>The principles that drive every single line of code we write.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px" }}>
            {[
              { icon: <LucideZap size={22} />, title: "Hyper-Speed", desc: "We optimize for sub-millisecond responses. Your time is valuable. Optimized for efficiency at every level.", img: "/images/recruitment_speed_card_1774428205421.png" },
              { icon: <LucideShieldCheck size={22} />, title: "Fort-Level Security", desc: "Enterprise-grade encryption is not a feature; it's our foundation. Military grade protection for all.", img: "/images/recruitment_security_card_1774428225196.png" },
              { icon: <LucideSmile size={22} />, title: "People First", desc: "Software should serve humans. UX is our soul and focus. Building tech that matters to individuals.", img: "/images/recruitment_people_card_1774428243663.png" },
              { icon: <LucideTrendingUp size={22} />, title: "Elastic Scaling", desc: "From startups to 10,000-seat enterprises, we scale effortlessly. Robust growth support included.", img: "/images/recruitment_scaling_card_1774428267739.png" },
              { icon: <LucideUsers size={22} />, title: "Community Centric", desc: "We build based on what our users need, not what we think. Driven by feedback loop.", img: "/images/recruitment_community_card_new_1774428287131.png" },
              { icon: <LucideMessageSquare size={22} />, title: "Radical Transparency", desc: "No hidden costs, no surprise limits. Just pure value, upfront. Every detail matters.", img: "/images/recruitment_transparency_card_new_1774428307248.png" }
            ].map((val, i) => (
              <motion.div
                key={i}
                initial="initial"
                whileHover="hover"
                style={{
                  background: "#ffffff",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  height: "100%",
                  minHeight: "455px",
                  borderRadius: "0px",
                  border: "1px solid #eee"
                }}
              >
                {/* 1. Corner Accent (The Origin Point) */}
                <div style={{
                  position: "absolute", top: 0, right: 0, width: "32px", height: "32px",
                  background: "#0c2854", borderRadius: "0 0 0 45px", zIndex: 15
                }} />

                {/* 2. Radial Color Fill- From the Top Right Corner Notch */}
                <motion.div
                  variants={{
                    initial: { clipPath: "circle(0% at right top)" },
                    hover: { clipPath: "circle(150% at right top)" }
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    background: "#0c2854", zIndex: 5
                  }}
                />

                {/* 3. Text Section Content */}
                <div style={{ position: "relative", zIndex: 10, padding: "40px 30px 20px", flex: 1.2 }}>
                  {/* Icon Badge */}
                  <motion.div
                    variants={{
                      initial: { background: "#0c2854", color: "#ffffff" },
                      hover: { background: "#ffffff", color: "#0c2854" }
                    }}
                    style={{
                      width: "60px", height: "60px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "25px",
                      boxShadow: "0 8px 18px rgba(0,0,0,0.12)"
                    }}>
                    {val.icon}
                  </motion.div>

                  <motion.h4
                    variants={{
                      initial: { color: "#0c2854" },
                      hover: { color: "#ffffff" }
                    }}
                    style={{ fontSize: "1.55rem", fontWeight: "900", marginBottom: "15px", letterSpacing: "-0.01em" }}>
                    {val.title}
                  </motion.h4>

                  <motion.p
                    variants={{
                      initial: { color: "#4b5563" },
                      hover: { color: "rgba(255,255,255,0.85)" }
                    }}
                    style={{ lineHeight: 1.6, fontSize: "1rem" }}>
                    {val.desc}
                  </motion.p>
                </div>

                {/* 4. Bottom Image Section (Simplified - Removed the wavy shape) */}
                <div style={{ height: "205px", width: "100%", overflow: "hidden", position: "relative", zIndex: 10, borderTop: "1px solid #eee" }}>
                  <img src={val.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={val.title} />

                  {/* Interaction Button */}
                  <motion.div
                    variants={{
                      initial: { opacity: 0, scale: 0.8, x: 12 },
                      hover: { opacity: 1, scale: 1, x: 0 }
                    }}
                    style={{
                      position: "absolute", bottom: "22px", right: "22px", width: "42px", height: "42px",
                      borderRadius: "10px", background: "#2563eb", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20,
                      boxShadow: "0 8px 18px rgba(37,99,235,0.4)"
                    }}
                  >
                    <LucideArrowUpRight size={22} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TEAM STORY PREVIEW */}
      <section style={{ padding: "50px 0 120px", background: "white" }}>
        <div className="container" style={{ display: "flex", gap: "80px", alignItems: "center" }}>
          <div style={{ flex: 1.2 }}>
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 style={{ fontSize: "3.5rem", fontWeight: "900", lineHeight: 1.1, marginBottom: "30px" }}>The Givyansh <span style={{ color: "#2563eb" }}>Heritage</span></h2>
              <p style={{ color: "#444", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: "40px" }}>
                Started as a small collection of scripts to help recruiters manage high call volumes, 
                Givyansh has evolved into a powerhouse platform that handles millions of interactions monthly. 
                Our journey is defined by the successes of the thousands of recruiters who use our platform every morning.
              </p>
              <div style={{ display: "flex", gap: "45px" }}>
                <div>
                  <h4 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#16a34a" }}>2021</h4>
                  <p style={{ color: "#888", fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Founded</p>
                </div>
                <div>
                  <h4 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#2563eb" }}>140+</h4>
                  <p style={{ color: "#888", fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Features</p>
                </div>
              </div>
            </motion.div>
          </div>
          <div style={{ flex: 0.8 }}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = x - xc;
                const dy = y - yc;
                
                // Set rotation based on mouse position
                const rotateX = (dy / yc) * -15; // Max 15 degree tilt
                const rotateY = (dx / xc) * 15;
                
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
              }}
              style={{ 
                position: "relative", 
                transition: "transform 0.2s ease-out",
                transformStyle: "preserve-3d"
              }}
            >
              <div style={{ 
                width: "100%", 
                height: "420px", 
                borderRadius: "40px", 
                overflow: "hidden", 
                boxShadow: "0 30px 70px rgba(0,0,0,0.12)",
                border: "1px solid #f1f5f9",
                transform: "translateZ(20px)"
              }}>
                 <img 
                   src="/images/recruitment_speed_card_1774428205421.png" 
                   style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                   alt="Heritage" 
                 />
              </div>
              {/* Floating Badge */}
              <div style={{ 
                position: "absolute", bottom: "30px", left: "-25px", 
                background: "white", padding: "18px 28px", borderRadius: "20px", 
                boxShadow: "0 20px 50px rgba(0,0,0,0.15)", display: "flex", 
                alignItems: "center", gap: "15px", zIndex: 10,
                transform: "translateZ(40px)"
              }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 15px #10b981" }} />
                <span style={{ fontWeight: "800", color: "#1a1a1a", fontSize: "0.95rem" }}>25+ Experts</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. THE GIVYANSH EVOLUTION (STATIC DISPLAY) */}
      <section style={{ padding: "40px 0 120px", background: "white" }}>
        <div className="container">
          
          {/* Section Heading */}
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span style={{ color: "#2563eb", fontWeight: "900", letterSpacing: "0.25em", fontSize: "0.85rem", textTransform: "uppercase" }}>THE TIMELINE OF GROWTH</span>
                <h2 style={{ fontSize: "3.5rem", fontWeight: "900", color: "#0c2854", marginTop: "15px" }}>The Givyansh Evolution</h2>
                <p style={{ fontSize: "1.2rem", color: "#475569", maxWidth: "700px", margin: "20px auto 0", lineHeight: "1.6" }}>
                  From a precision technology lab in Mumbai to a global AI powerhouse. Explore the milestones that reflect our evolution.
                </p>
            </motion.div>
          </div>

          {/* Static Timeline Display */}
          <div style={{ position: "relative", width: "100%" }}>
            <JourneyTimeline />
          </div>
        </div>
      </section>

      {/* 6. MEET OUR TEAM SECTION */}
      <section style={{ padding: "40px 0 120px", background: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span style={{ color: "#2563eb", fontWeight: "900", letterSpacing: "0.25em", fontSize: "0.85rem", textTransform: "uppercase" }}>THE ARCHITECTS OF SUCCESS</span>
                <h2 style={{ fontSize: "3.5rem", fontWeight: "900", color: "#0c2854", marginTop: "15px" }}>Meet Our Team</h2>
                <p style={{ fontSize: "1.15rem", color: "#64748b", maxWidth: "600px", margin: "20px auto 0" }}>
                  The visionary minds driving our mission to redefine global recruitment through neural intelligence.
                </p>
            </motion.div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px", maxWidth: "1100px", margin: "0 auto" }}>
            {[
              {
                name: "Aarav Saxena",
                role: "Founder & CEO",
                desc: "15+ years of recruitment tech expertise. Driven by a vision to make talent management fast and frictionless.",
                img: "/images/ceo.png"
              },
              {
                name: "Dr. Ananya Reddy",
                role: "Chief AI Officer",
                desc: "Previously at DeepMind. Architect of our neural integration engine and predictive matching algorithms.",
                img: "/images/cto.png"
              },
              {
                name: "Sana Malhotra",
                role: "Director of Operations",
                desc: "Scaling expert who grew our global labs from Mumbai to Singapore. Obsessed with operational efficiency.",
                img: "/images/coo.png"
              }
            ].map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                style={{ 
                  background: "white", 
                  borderRadius: "24px", 
                  overflow: "hidden", 
                  boxShadow: "0 25px 50px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9"
                }}
              >
                <div style={{ height: "280px", overflow: "hidden", position: "relative" }}>
                   <img src={member.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={member.name} />
                   <div style={{ position: "absolute", bottom: "15px", right: "15px" }}>
                     <Link to="#" style={{ background: "white", color: "#0077b5", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
                       <LucideArrowUpRight size={18} />
                     </Link>
                   </div>
                </div>
                <div style={{ padding: "20px", textAlign: "center" }}>
                   <h4 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#0c2854", marginBottom: "6px" }}>{member.name}</h4>
                   <p style={{ color: "#2563eb", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "15px" }}>{member.role}</p>
                   <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.9rem" }}>{member.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. REDESIGNED FULL-WIDTH 'NEURAL GATEWAY' CTA SECTION (TOUCHING FOOTER) */}
      <section style={{ width: "100%", padding: "50px 0", background: "url('/images/cta_bg.png')", backgroundSize: "cover", backgroundPosition: "center", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Cinematic Gradient Overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(90deg, rgba(12, 40, 84, 0.95) 0%, rgba(37, 99, 235, 0.8) 50%, rgba(16, 185, 129, 0.9) 100%)", zIndex: 1 }} />
        
        {/* Interactive Pulse Halo */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ position: "absolute", top: "50%", left: "50%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(14, 165, 233, 0.2)", filter: "blur(60px)", transform: "translate(-50%, -50%)", zIndex: 2 }} 
        />

        <div className="container" style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px" }}>
          <div style={{ flex: 1.5 }}>
            <motion.div initial={{ opacity: 0, x: -25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "5px 14px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "900", marginBottom: "15px", backdropFilter: "blur(4px)" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} /> SYSTEM SCALE CAPABLE
              </div>
              <h2 style={{ fontSize: "2.6rem", fontWeight: "900", color: "white", lineHeight: 1.1, marginBottom: "10px", letterSpacing: "-0.02em" }}>
                Ready to scale your <span style={{ color: "#0ea5e9" }}>agency's velocity?</span>
              </h2>
              <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>Join the elite recruitment teams switching to Givyansh ecosystems daily.</p>
            </motion.div>
          </div>

          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "20px" }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/contact" style={{ 
                background: "white", color: "#2563eb", 
                width: "185px", height: "58px",
                borderRadius: "14px", fontWeight: "900", fontSize: "1rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px",
                transition: "all 0.3s ease"
              }}>
                Get Started <LucideArrowUpRight size={18} />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/pricing" style={{ 
                background: "rgba(14, 165, 233, 0.15)", border: "1px solid rgba(255,255,255,0.25)", 
                backdropFilter: "blur(10px)", color: "white", 
                width: "185px", height: "58px",
                borderRadius: "14px", fontWeight: "800", fontSize: "1rem",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s ease"
              }}>
                View Pricing
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
