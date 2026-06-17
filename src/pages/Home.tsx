import React, { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, Variants } from "framer-motion";
import { 
  LucideTrendingUp,
  LucideUsers,
  LucideDollarSign,
  LucideBarChart3,
  LucidePieChart,
  LucideShieldCheck,
  LucideFileText,
  LucideSettings2,
  LucidePlus,
  LucideZap,
  LucideAtSign,
  LucideLayers,
  LucideChevronLeft,
  LucideChevronRight,
  LucideStar,
  LucideMail, 
  LucidePhone, 
  LucideMapPin, 
  LucideCpu, 
  LucideRocket, 
  LucideGlobe, 
  LucideActivity, 
  LucideSmile, 
  LucideShield 
} from "lucide-react";
import "@/styles/Pages.css";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerChildren: Variants = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// --- Floating Decorative Components (Side Art) ---
interface FloatingMarkProps {
  icon: any; 
  delay?: number; 
  x: number; 
  y: number; 
  size?: number; 
  color?: string; 
  opacity?: number;
}

const FloatingMark = ({ icon: Icon, delay = 0, x, y, size = 32, color = "#ff5e4d", opacity = 0.6 }: FloatingMarkProps) => (
    <motion.div 
        animate={{ 
            y: [y, y - 50, y],
            x: [x, x + 30, x],
            rotate: [0, 45, -45, 0],
            scale: [1, 1.2, 1]
        }}
        transition={{ duration: 7 + Math.random() * 5, repeat: Infinity, delay, ease: "easeInOut" }}
        style={{ position: "absolute", left: `${x}%`, top: `${y}%`, pointerEvents: "none", zIndex: 0, opacity }}
    >
        <Icon size={size} color={color} strokeWidth={2} />
    </motion.div>
);

// --- Testimonial Data ---
const testimonials = [
    { name: "Sarah Mitchell", role: "HR Director at Nexa Solutions", img: "https://i.pravatar.cc/150?u=sarah", rating: "5.0", text: "CoreShift has streamlined our HR processes, making tasks like onboarding and performance tracking more efficient. It helps us stay organized and saves our team time, allowing us to focus more on supporting our employees." },
    { name: "James Carter", role: "HR Manager at BrightPath Solutions", img: "https://i.pravatar.cc/150?u=james", rating: "5.0", text: "The platform is easy to use, keeps everything in one place, and helps our team stay on top of things without extra hassle. Highly recommended for growing teams." },
    { name: "Anita Rao", role: "COO at TechFlow India", img: "https://i.pravatar.cc/150?u=anita", rating: "4.9", text: "Implementing CoreShift was the best decision for our operations. The real-time data insights and employee management tools are top-notch and user-friendly." }
];

export default function Home() {
    const scrollRef = useRef(null);
    const testiSectionRef = useRef(null);

    // --- Bento Grid Scroll Logic ---
    const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start end", "end start"] });
    const springScroll = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

    const xLeft = useTransform(springScroll, [0.3, 0.7], [0, 180]);
    const xRight = useTransform(springScroll, [0.3, 0.7], [0, -180]);
    const scaleLeft = useTransform(springScroll, [0.3, 0.5, 0.7], [1, 0.9, 0.85]);
    const scaleRight = useTransform(springScroll, [0.3, 0.5, 0.7], [0.85, 0.9, 1]);
    const zLeft = useTransform(springScroll, [0, 0.49, 0.5, 1], [2, 2, 1, 1]);
    const zRight = useTransform(springScroll, [0, 0.49, 0.5, 1], [1, 1, 2, 2]);

    // --- STICKY TESTIMONIAL PROGRESS (SMOOTH SPRING) ---
    const { scrollYProgress: testiScroll } = useScroll({
        target: testiSectionRef,
        offset: ["start start", "end end"]
    });
    
    // Smooth the scroll input
    const smoothTestiScroll = useSpring(testiScroll, { 
        stiffness: 80, 
        damping: 25, 
        restDelta: 0.001 
    });

    const sideXPositive = useTransform(smoothTestiScroll, [0.1, 0.6], [0, 460]);
    const sideXNegative = useTransform(smoothTestiScroll, [0.1, 0.6], [0, -460]);
    const sideOpacity = useTransform(smoothTestiScroll, [0.2, 0.5], [0, 1]);
    const centerScale = useTransform(smoothTestiScroll, [0, 0.2], [0.8, 1]);
    const revealOpacity = useTransform(smoothTestiScroll, [0.65, 0.8], [0, 1]); // For arrows

    // Timers
    const [hrStep, setHrStep] = useState(0);
    const [managerStep, setManagerStep] = useState(0);
    const [activeIdx, setActiveIdx] = useState(0);
    const [testiIdx, setTestiIdx] = useState(0);

    const hrItems = [
        <div key="1" style={{ width: "100%", height: "100%", background: "white", borderRadius: "16px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "0.7rem", fontWeight: 800 }}>Attendance Report</span><div style={{ fontSize: "0.5rem", background: "#f5f5f5", padding: "2px 6px", borderRadius: "4px" }}>Monthly ▼</div></div><div style={{ display: "flex", alignItems: "flex-end", height: "60px", gap: "4px", paddingBottom: "5px", borderBottom: "1px dashed #eee" }}><div style={{ flex: 1, height: "40%", background: "#a78bfa", borderRadius: "2px" }}></div><div style={{ flex: 1, height: "60%", background: "#f87171", borderRadius: "2px" }}></div><div style={{ flex: 1, height: "85%", background: "#8b5cf6", borderRadius: "2px", position: "relative" }}><div style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", background: "black", color: "white", fontSize: "0.4rem", padding: "2px 4px", borderRadius: "4px" }}>+17%</div></div></div></div>,
        <div key="2" style={{ width: "100%", height: "100%", background: "white", borderRadius: "16px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "0.7rem", fontWeight: 800 }}>Global Team</span><LucideUsers size={12} color="#006aff" /></div><div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{[1, 2, 3].map((i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: 14, height: 14, borderRadius: "50%", background: i === 1 ? "#fb7185" : i === 2 ? "#60a5fa" : "#34d399" }}></div><div style={{ height: 4, width: i === 1 ? "60%" : i === 2 ? "40%" : "80%", background: "#f0f0f0", borderRadius: 2 }}></div></div>))}</div></div>,
        <div key="3" style={{ width: "100%", height: "100%", background: "white", borderRadius: "16px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "0.7rem", fontWeight: 800 }}>Financial Summary</span><LucideDollarSign size={12} color="#10b981" /></div><div style={{ height: "45px", background: "linear-gradient(90deg, #f0f4ff, transparent)", borderRadius: 8, display: "flex", alignItems: "center", padding: "0 10px" }}><div style={{ fontSize: "0.9rem", fontWeight: 800 }}>$42,500.00</div></div></div>
    ];

    const managerCards = [
        { title: "Make Data-Driven Decisions", icon: <LucideBarChart3 size={16} />, color: "#ff5e3a" },
        { title: "Track Performance in Real Time", icon: <LucidePieChart size={16} />, color: "#ffc107" },
        { title: "Access Real-Time Insights", icon: <LucideTrendingUp size={16} />, color: "#1ececc" },
        { title: "Monitor Strategic Goals", icon: <LucideZap size={16} />, color: "#3b82f6" }
    ];

    const integrations = [
        { name: "Slack", desc: "Team communication & collaboration", icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" },
        { name: "Gmail", desc: "Unified email & inbox management", icon: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" },
        { name: "Loom", desc: "Video feedback & communication", icon: "https://cdn.worldvectorlogo.com/logos/loom-1.svg" },
        { name: "Meet", desc: "Smart video meetings & sync", icon: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg" },
        { name: "Teams", desc: "Collaborate with Microsoft Teams", icon: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg" },
        { name: "Outlook", desc: "Enterprise mail & calendar sync", icon: "https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" },
        { name: "Hostinger", desc: "Premium web hosting & domain", icon: "https://www.vectorlogo.zone/logos/hostinger/hostinger-icon.svg" }
    ];

    useEffect(() => {
        const hT = setInterval(() => setHrStep((prev) => (prev + 1) % hrItems.length), 3000);
        const mT = setInterval(() => setManagerStep((prev) => (prev + 1) % managerCards.length), 3000);
        const iT = setInterval(() => setActiveIdx((prev) => prev + 1), 3500);
        const testT = setInterval(() => setTestiIdx((prev) => (prev + 1) % testimonials.length), 3500);
        return () => { clearInterval(hT); clearInterval(mT); clearInterval(iT); clearInterval(testT); };
    }, []);

  return (
    <MainLayout className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-v2" style={{ overflow: "visible" }}>
        <div className="container" style={{ maxWidth: 1150 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="hero-v2-heading" style={{ fontSize: "3.5rem", fontWeight: "900", letterSpacing: "-0.04em" }}>
              <span style={{ color: "#2563eb" }}>Empower</span> your people to <br /> 
              do their <span style={{ color: "#2563eb" }}>best work.</span>
            </h1>
            <p className="hero-v2-subtitle" style={{ fontSize: "1rem", color: "#16a34a", marginBottom: "40px", fontWeight: "600" }}>
              One tool for your whole team. Write, plan, and get organized.
            </p>
            <div className="hero-v2-cta" style={{ marginBottom: "60px" }}>
              <div className="cta-input-group">
                <input type="email" placeholder="Enter your email..." />
                <button type="submit" className="cta-submit-btn">Get Started</button>
              </div>
            </div>
            <motion.div className="hero-v2-mockup-wrapper" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2 }} style={{ maxWidth: "1150px", background: "transparent", boxShadow: "none", padding: 0, margin: "0 auto", border: "none" }}>
              <img src="/images/dashboard-mockup-v2.png" alt="CRM" className="hero-v2-mockup-img" style={{ width: "100%", height: "auto", borderRadius: "20px", boxShadow: "0 40px 100px rgba(0,0,0,0.12)", border: "1.5px solid #f0f0f0" }} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. BUILT FOR EVERYONE */}
      <section className="bento-outer" style={{ padding: "40px 20px 40px" }} ref={scrollRef}>
        <div className="bento-wrapper" style={{ maxWidth: "950px" }}>
          <div className="bento-header" style={{ marginBottom: "35px" }}>
            <motion.h2 className="bento-title" style={{ fontSize: "2.6rem" }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}><span style={{ color: "#2563eb" }}>Built</span> for everyone</motion.h2>
            <motion.p className="bento-subtitle" style={{ fontSize: "0.9rem", color: "#16a34a", fontWeight: "600" }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>Thousands of businesses use CoreShift to manage their global teams.</motion.p>
          </div>

          <motion.div className="bento-grid-upper" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerChildren} style={{ gap: "20px" }}>
            <motion.div className="sleek-card" variants={fadeInUp}>
              <div className="sleek-card-graphic" style={{ backgroundColor: "#F9F9F9", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AnimatePresence mode="popLayout">{[-1, 0, 1].map((offset) => {
                    const cur = (hrStep + offset + hrItems.length) % hrItems.length;
                    return (<motion.div key={cur + "-" + offset} initial={{ x: offset * 260, opacity: 0, scale: 0.8 }} animate={{ x: offset * 220, opacity: offset === 0 ? 1 : 0.25, scale: offset === 0 ? 1 : 0.85, filter: offset === 0 ? "blur(0px)" : "blur(4px)", zIndex: offset === 0 ? 10 : 1 }} exit={{ x: (offset - 1) * 220, opacity: 0, scale: 0.7 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} style={{ position: "absolute", width: "210px", height: "135px" }}>{hrItems[cur]}</motion.div>);
                  })}</AnimatePresence>
                </div>
              </div>
              <h3 className="sleek-card-title">For HR professionals</h3>
              <p className="sleek-card-text">Use a single cloud system for your employees, candidates and HR processes info.</p>
            </motion.div>

            <motion.div className="sleek-card" variants={fadeInUp}>
              <div className="sleek-card-graphic" style={{ backgroundColor: "#FFFFFF", overflow: "hidden", position: "relative" }}>
                {[240, 180, 120].map((size, i) => (<div key={i} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: size, height: size, border: "1px solid #f2f2f2", borderRadius: "50%", pointerEvents: "none" }}></div>))}
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AnimatePresence mode="popLayout" initial={false}>{[0, 1, 2].map((stackIdx) => {
                    const itemIdx = (managerStep + stackIdx) % managerCards.length;
                    const card = managerCards[itemIdx];
                    const isMain = stackIdx === 0;
                    return (<motion.div key={itemIdx + "-" + stackIdx} initial={{ opacity: 0, scale: 0.7, y: 40 }} animate={{ y: stackIdx * 12, opacity: isMain ? 1 : (stackIdx === 1 ? 0.85 : 0.6), scale: isMain ? 1 : 1 - (stackIdx * 0.04), zIndex: 10 - stackIdx }} exit={isMain ? { y: -100, opacity: 0, scale: 1.1 } : { opacity: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} style={{ position: "absolute", width: "220px", background: "white", borderRadius: "14px", padding: "14px", boxShadow: isMain ? "0 15px 40px rgba(0,0,0,0.06)" : "0 8px 15px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px", border: "1.5px solid #f0f0f0" }}><div style={{ background: card.color, color: "white", padding: 8, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{card.icon}</div><span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1a1a1a", lineHeight: 1.1 }}>{card.title}</span></motion.div>);
                  })}</AnimatePresence>
                </div>
              </div>
              <h3 className="sleek-card-title">For managers & leaders</h3>
              <p className="sleek-card-text">Get up-to-date data and monitor company performance in real-time.</p>
            </motion.div>

            <motion.div className="sleek-card" variants={fadeInUp}>
              <div className="sleek-card-graphic" style={{ background: "radial-gradient(circle at center, #ffffff 0%, #f9f9f9 100%)", backgroundImage: "radial-gradient(#e5e5e5 0.5px, transparent 0.5px)", backgroundSize: "20px 20px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: "80px", height: "105px", background: "white", borderRadius: "8px", border: "1px solid #eee", transform: "rotate(-12deg) translateX(-45px)", boxShadow: "0 10px 20px rgba(0,0,0,0.03)", padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}><div style={{ width: "30%", height: "10px", background: "#f5f5f5", borderRadius: 2 }}></div><div style={{ width: "100%", height: "4px", background: "#f9f9f9", borderRadius: 1 }}></div><div style={{ width: "80%", height: "4px", background: "#f9f9f9", borderRadius: 1 }}></div></div><div style={{ position: "absolute", width: "80px", height: "105px", background: "white", borderRadius: "8px", border: "1px solid #eee", transform: "rotate(12deg) translateX(45px)", boxShadow: "0 10px 20px rgba(0,0,0,0.03)", padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}><div style={{ width: "30%", height: "10px", background: "#f5f5f5", borderRadius: 2 }}></div><div style={{ width: "100%", height: "4px", background: "#f9f9f9", borderRadius: 1 }}></div><div style={{ width: "80%", height: "4px", background: "#f9f9f9", borderRadius: 1 }}></div></div>
                <div style={{ position: "relative", width: "65px", height: "65px", background: "#8b5cf6", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 15px 30px rgba(139, 92, 246, 0.3)", color: "white", zIndex: 2 }}><LucideShieldCheck size={32} /></div>
              </div>
              <h3 className="sleek-card-title">For legal teams</h3>
              <p className="sleek-card-text">CoreShift helps legal teams by streamlining compliance and contracts.</p>
            </motion.div>
          </motion.div>

          {/* Lower Bento Grid */}
          <motion.div className="bento-grid-lower" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerChildren} style={{ gap: "20px" }}>
            <motion.div className="sleek-card horizontal" variants={fadeInUp} style={{ padding: "30px", background: "white", position: "relative" }}>
              <div style={{ position: "absolute", top: "25px", left: "30px", width: "50px", height: "50px", background: "white", border: "1px solid #f0f0f0", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 15px rgba(0,0,0,0.03)" }}><div style={{ width: "30px", height: "30px", background: "#ff5e4d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><LucideFileText size={16} strokeWidth={3} /></div></div>
              <div className="sleek-card-content" style={{ marginTop: "60px", paddingRight: "40px" }}><h3 className="sleek-card-title" style={{ fontSize: "1.7rem", fontWeight: "800", marginBottom: "15px" }}>All employee data at once</h3><p className="sleek-card-text" style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.6, maxWidth: "380px" }}>Contact and personal information, paid and unpaid leave balances, career history, projects and more.</p></div>
              <div className="sleek-card-graphic" style={{ position: "relative", flex: 1.5, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "260px" }}>
                <motion.div style={{ position: "absolute", width: "250px", height: "190px", background: "white", borderRadius: "14px", border: "1px solid #eee", boxShadow: "0 20px 40px rgba(0,0,0,0.04)", padding: "15px", x: xRight, zIndex: zRight, scale: scaleRight, display: "flex", flexDirection: "column", gap: "8px", right: "-10%" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "0.75rem", fontWeight: "800" }}>Training Participation</span></div><div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px", borderBottom: "1px dashed #f0f0f0", paddingBottom: "5px" }}>{[30, 60, 45, 80, 40].map((h, i) => (<div key={i} style={{ flex: 1, height: `${h}%`, background: i === 3 ? "#8b5cf6" : "#f0f0f0", borderRadius: "3px" }}></div>))}</div></motion.div>
                <motion.div style={{ position: "absolute", width: "220px", height: "220px", background: "white", borderRadius: "14px", border: "1px solid #eee", boxShadow: "0 20px 40px rgba(0,0,0,0.06)", padding: "15px", x: xLeft, zIndex: zLeft, scale: scaleLeft, display: "flex", flexDirection: "column", gap: "12px", left: "5%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "0.8rem", fontWeight: "900" }}>Employees</span><span style={{ fontSize: "0.6rem", color: "#006aff" }}>See all</span></div>
                  {[{ name: "Girish Goswami", role: "Software Developer" }, { name: "Divyanshu Sharma", role: "Software Developer" }, { name: "Poonam Rajput", role: "Digital TL" }].map((user, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f88", border: "1px solid #f0f0f0" }}></div><div style={{ flex: 1 }}><div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#333" }}>{user.name}</div><div style={{ fontSize: "0.5rem", color: "#999" }}>{user.role}</div></div></div>))}
                </motion.div>
              </div>
            </motion.div>
            <motion.div className="sleek-card" variants={fadeInUp}>
              <div className="sleek-card-graphic" style={{ backgroundColor: "#FFFFFF", overflow: "hidden", position: "relative", minHeight: "200px" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "62px", height: "62px", zIndex: 10 }}><img src="/images/Favicon_logo_Givyansh_CRM_(_Fast_RMS_)_logo_bg_removed.png.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", width: "160px", height: "160px" }}>
                    {[...Array(10)].map((_, i) => (<div key={i} style={{ position: "absolute", left: `calc(50% + ${Math.cos((i * 36) * (Math.PI / 180)) * 70}px)`, top: `calc(50% + ${Math.sin((i * 36) * (Math.PI / 180)) * 70}px)`, width: "36px", height: "36px", transform: "translate(-50%, -50%)", overflow: "hidden", borderRadius: "8px" }}><img src={`https://i.pravatar.cc/100?u=v3_${i}`} alt="av" style={{ width: "100%" }} /></div>))}
                  </motion.div>
                </div>
              </div>
              <div style={{ padding: "0 22px 25px" }}><h3 className="sleek-card-title">For teams & employees</h3><p className="sleek-card-text">Get to know who is going to be out of office and be aware of upcoming events.</p></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="services-grid-section" style={{ padding: "10px 20px 40px", background: "white" }}>
        <div className="container" style={{ maxWidth: "1150px" }}>
          <div className="section-header" style={{ textAlign: "center", marginBottom: "60px" }}>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: "3rem", fontWeight: "900", color: "#1a1a1a", letterSpacing: "-0.04em", marginBottom: "15px" }}
            >
              Our <span className="text-gradient">Premium</span> Services
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ color: "#16a34a", fontSize: "1.1rem", fontWeight: "600" }}
            >
              Industry-leading solutions designed to scale your high-performance recruitment team.
            </motion.p>
          </div>

          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
            {[
              { icon: <LucideCpu />, title: "AI-Powered Matching", desc: "Our advanced neural networks identify the perfect candidate fits before you even read a resume." },
              { icon: <LucideRocket />, title: "Rapid Onboarding", desc: "Slash your time-to-hire by 60% with our automated candidate workflows and digital signature integration." },
              { icon: <LucideGlobe />, title: "Global Talent Pool", desc: "Access verified professionals across 50+ countries with localized tax and compliance management." },
              { icon: <LucideActivity />, title: "Performance Trackers", desc: "Real-time KPI dashboards for recruiters, managers, and stakeholders to monitor every metric that matters." },
              { icon: <LucideSmile />, title: "Candidate Experience", desc: "Delight talent with a mobile-first portal, instant interview scheduling, and automated status updates." },
              { icon: <LucideShield />, title: "Enterprise Security", desc: "Military-grade data protection and custom RBAC ensure your intellectual property stays within your walls." }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.1)", borderColor: "#2563eb" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ 
                  background: "#f8fafc", 
                  padding: "40px", 
                  borderRadius: "24px", 
                  border: "1.5px solid #f0f0f0",
                  transition: "all 0.3s ease"
                }}
                className="service-card"
              >
                <div style={{ width: "50px", height: "50px", background: "white", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", marginBottom: "25px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                  {service.icon}
                </div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1a1a1a", marginBottom: "15px" }}>{service.title}</h3>
                <p style={{ color: "#555", lineHeight: 1.6, fontSize: "0.95rem" }}>{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. INTEGRATION SECTION */}
      <section className="integrations-v2" style={{ padding: "0px 20px 0px", background: "var(--bg-secondary)", position: "relative", overflow: "hidden" }}>
        <FloatingMark icon={LucidePlus} x={10} y={15} size={35} color="#006aff" delay={0} />
        <FloatingMark icon={LucideZap} x={5} y={50} size={42} color="#ff5e4d" delay={1.5} />
        <FloatingMark icon={LucideLayers} x={90} y={20} size={38} color="#8b5cf6" delay={0.5} />
        <FloatingMark icon={LucideAtSign} x={94} y={70} size={32} color="#10b981" delay={3} />

        <div className="container" style={{ maxWidth: 1050, background: "white", borderRadius: "45px", padding: "40px 40px 40px", border: "1px solid #ececec", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.03)", position: "relative", zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div style={{ display: "inline-flex", padding: "10px", background: "white", border: "1.5px solid #f0f0f0", borderRadius: "14px", boxShadow: "0 8px 15px rgba(0,0,0,0.03)", marginBottom: "25px" }}><LucideSettings2 size={24} color="#ff5e4d" strokeWidth={2.5} /></div>
            <h2 style={{ fontSize: "2.8rem", fontWeight: "900", marginBottom: "60px" }}>Integrate <span style={{ color: "#2563eb" }}>with</span> your existing <br /> tools in seconds</h2>
          </motion.div>
          <div style={{ position: "relative", height: "200px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px", overflow: "hidden" }}>
            <AnimatePresence initial={false}>
              {[-2, -1, 0, 1, 2].map((offset) => {
                const idx = (activeIdx + offset) % integrations.length;
                const tool = integrations[idx < 0 ? idx + integrations.length : idx];
                const isActive = offset === 0;
                return (
                  <motion.div key={activeIdx + offset} initial={{ x: (offset + 1) * 130, opacity: 0 }} animate={{ x: offset * 130, y: Math.abs(offset) * 35, opacity: 1, scale: isActive ? 1.25 : 0.8, rotate: offset * 12 }} exit={{ x: (offset - 1) * 130, opacity: 0 }} transition={{ duration: 0.8 }} style={{ position: "absolute", width: "95px", height: "95px", background: "white", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", border: isActive ? "2px solid #eee" : "1px solid #f2f2f2", boxShadow: isActive ? "0 25px 50px rgba(0,0,0,0.08)" : "0 8px 20px rgba(0,0,0,0.02)", zIndex: isActive ? 50 : 10 }}>
                    <img src={tool.icon} alt={tool.name} style={{ width: "55px", height: "55px", objectFit: "contain" }} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div style={{ marginTop: "20px" }}><h4 style={{ fontSize: "1.45rem", fontWeight: "900" }}>{integrations[activeIdx % integrations.length].name}</h4><p style={{ fontSize: "0.98rem", color: "#888" }}>{integrations[activeIdx % integrations.length].desc}</p></div>
        </div>
      </section>

      {/* 5. WHY GIVYANSH SECTION (INFINITE MARQUEE) */}
      <section className="why-givyansh" style={{ padding: "40px 0 80px", background: "white", overflow: "hidden" }}>
        <div className="container" style={{ maxWidth: 1150, textAlign: "center", marginBottom: "50px" }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: "2.8rem", fontWeight: "900", color: "#1a1a1a" }}
          >
            Why Always <span style={{ color: "#2563eb" }}>Givyansh</span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ color: "#16a34a", fontSize: "1rem", fontWeight: "600", marginTop: "10px" }}
          >
            Built for speed, security, and effortless team growth.
          </motion.p>
        </div>

        <div className="marquee-container" style={{ position: "relative", width: "100%", display: "flex", overflow: "hidden" }}>
          <motion.div 
            className="marquee-track"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            style={{ display: "flex", gap: "25px", width: "fit-content" }}
          >
            {[
              { icon: <LucideZap size={24} />, title: "Lightning Fast", color: "#f59e0b", desc: "Optimized for sub-second responses even with massive datasets." },
              { icon: <LucideShieldCheck size={24} />, title: "Secure Data", color: "#10b981", desc: "Enterprise-grade encryption protecting your most sensitive info." },
              { icon: <LucideTrendingUp size={24} />, title: "Scalable Growth", color: "#8b5cf6", desc: "From startups to enterprises, Givyansh grows alongside you." },
              { icon: <LucideBarChart3 size={24} />, title: "Live Analytics", color: "#3b82f6", desc: "Real-time KPI tracking for data-driven strategic decisions." },
              { icon: <LucideLayers size={24} />, title: "Seamless Sync", color: "#ef4444", desc: "Instant integration with Slack, Meet, Gmail and 50+ other apps." },
              { icon: <LucideUsers size={24} />, title: "Pro Support", color: "#2563eb", desc: "Dedicated experts available round the clock for your team." }
            ].concat([
              { icon: <LucideZap size={24} />, title: "Lightning Fast", color: "#f59e0b", desc: "Optimized for sub-second responses even with massive datasets." },
              { icon: <LucideShieldCheck size={24} />, title: "Secure Data", color: "#10b981", desc: "Enterprise-grade encryption protecting your most sensitive info." },
              { icon: <LucideTrendingUp size={24} />, title: "Scalable Growth", color: "#8b5cf6", desc: "From startups to enterprises, Givyansh grows alongside you." },
              { icon: <LucideBarChart3 size={24} />, title: "Live Analytics", color: "#3b82f6", desc: "Real-time KPI tracking for data-driven strategic decisions." },
              { icon: <LucideLayers size={24} />, title: "Seamless Sync", color: "#ef4444", desc: "Instant integration with Slack, Meet, Gmail and 50+ other apps." },
              { icon: <LucideUsers size={24} />, title: "Pro Support", color: "#2563eb", desc: "Dedicated experts available round the clock for your team." }
            ]).map((card, idx) => (
              <div 
                key={idx} 
                style={{ 
                  flex: "0 0 320px",
                  background: "#fdfdfd", 
                  padding: "30px", 
                  borderRadius: "24px", 
                  border: "1.5px solid #f0f0f0",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  transition: "all 0.3s ease",
                  cursor: "default"
                }}
              >
                <div style={{ color: card.color, background: `${card.color}15`, width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {card.icon}
                </div>
                <h4 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#1a1a1a" }}>{card.title}</h4>
                <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: "1.5" }}>{card.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. WORDS OF APPRECIATION (SMOOTH SPRING REVEAL) */}
      <section 
        className="testimonials-sticky-parent" 
        ref={testiSectionRef} 
        style={{ height: "120vh", position: "relative", background: "var(--bg-secondary)" }}
      >
        <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: "40px", overflow: "hidden" }}>
          <div className="container" style={{ maxWidth: "1200px", textAlign: "center", zIndex: 10, paddingBottom: "0px" }}>
            <h2 style={{ fontSize: "3.2rem", fontWeight: "900", letterSpacing: "-0.04em", marginBottom: "15px" }}>Words of <span style={{ color: "#16a34a" }}>Appreciation</span></h2>
            <p style={{ color: "#2563eb", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 50px", fontWeight: "600" }}>Thousands of businesses use CoreShift to handle payments.</p>
            
            <div style={{ position: "relative", width: "100%", height: "420px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        {[-1, 0, 1].map((offset) => {
                            const idx = (testiIdx + offset + testimonials.length) % testimonials.length;
                            const item = testimonials[idx];
                            const isMain = offset === 0;

                            return (
                                <motion.div
                                    key={testiIdx + "-" + offset}
                                    style={{ 
                                        position: "absolute", width: "440px", background: "white", padding: "40px", borderRadius: "24px", border: "1.5px solid #f0f0f0", boxShadow: "0 25px 60px rgba(0,0,0,0.06)",
                                        x: isMain ? 0 : (offset === 1 ? sideXPositive : sideXNegative), 
                                        opacity: isMain ? centerScale : sideOpacity,
                                        scale: isMain ? centerScale : 0.85,
                                        rotate: isMain ? 0 : offset * 12,
                                        zIndex: isMain ? 40 : 20
                                    }}
                                    animate={{ rotate: isMain ? 0 : offset * 12 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div style={{ width: "65px", height: "65px", borderRadius: "14px", overflow: "hidden", marginBottom: "15px" }}><img src={item.img} style={{ width: "100%" }} /></div>
                                        <h4 style={{ fontSize: "1.3rem", fontWeight: "900" }}>{item.name}</h4>
                                        <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "12px" }}>{item.role}</p>
                                        <div style={{ display: "flex", gap: "2px", color: "#fbbf24", marginBottom: "20px" }}>{[...Array(5)].map((_, i) => <LucideStar key={i} size={16} fill="#fbbf24" strokeWidth={0} />)}<span style={{ color: "#111", fontSize: "0.85rem", marginLeft: "6px", fontWeight: "700" }}>{item.rating}</span></div>
                                        <p style={{ fontSize: "0.95rem", color: "#444", lineHeight: 1.7 }}>"{item.text}"</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            <motion.div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px", opacity: revealOpacity }}>
                <button onClick={() => setTestiIdx((p) => (p - 1 + testimonials.length) % testimonials.length)} style={{ width: "50px", height: "50px", borderRadius: "50%", background: "white", border: "1.5px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><LucideChevronLeft size={20} /></button>
                <button onClick={() => setTestiIdx((p) => (p + 1) % testimonials.length)} style={{ width: "50px", height: "50px", borderRadius: "50%", background: "white", border: "1.5px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><LucideChevronRight size={20} /></button>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
