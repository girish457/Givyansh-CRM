import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LucideLayoutDashboard, LucideUsers, LucideBriefcase,
  LucideFileBarChart, LucideUser, LucideLogOut, LucideMenu,
  LucideX, LucideBell, LucideBuilding2, LucideChevronRight,
  LucideShield, LucideTrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VendorLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  vendorData?: any;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LucideLayoutDashboard size={18} /> },
  { id: "candidates", label: "My Candidates", icon: <LucideUsers size={18} /> },
  { id: "jobs", label: "Assigned Jobs", icon: <LucideBriefcase size={18} /> },
  { id: "reports", label: "Performance Reports", icon: <LucideTrendingUp size={18} /> },
  { id: "profile", label: "My Profile", icon: <LucideUser size={18} /> },
];

export default function VendorLayout({ children, activeTab, onTabChange, vendorData }: VendorLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await fetch("/api/vendor/logout", { method: "POST" });
    } catch (e) {}
    localStorage.removeItem("vendor_token");
    localStorage.removeItem("vendor_data");
    navigate("/vendor-login");
  };

  const displayName = vendorData?.name || "Vendor";
  const company = vendorData?.company || "";
  const vendorCode = vendorData?.vendorCode || "";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', -apple-system, sans-serif", background: "#f1f5f9" }}>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 260 : 72 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            height: "100vh",
            background: "linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)"
          }}
        >
          {/* Sidebar Header */}
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "11px", flexShrink: 0,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "white", fontSize: "1rem",
                boxShadow: "0 6px 16px rgba(59,130,246,0.4)"
              }}>G</div>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "white", lineHeight: 1.2, whiteSpace: "nowrap" }}>Givyansh CRM</div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Vendor Portal</div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Vendor Profile Card */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                margin: "16px", padding: "14px", borderRadius: "12px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                flexShrink: 0
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, color: "white", fontSize: "0.85rem"
                }}>{initials}</div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company}</div>
                  {vendorCode && (
                    <div style={{ fontSize: "0.6rem", color: "#60a5fa", fontWeight: 700, marginTop: "2px" }}>{vendorCode}</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Nav Items */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "8px", overflowX: "hidden" }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={!sidebarOpen ? item.label : undefined}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: "10px", padding: sidebarOpen ? "11px 14px" : "11px",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    borderRadius: "10px", border: "none", cursor: "pointer",
                    marginBottom: "2px",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(29,78,216,0.2))"
                      : hoveredItem === item.id ? "rgba(255,255,255,0.06)" : "transparent",
                    color: isActive ? "#60a5fa" : "rgba(255,255,255,0.65)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.85rem",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                    boxShadow: isActive ? "inset 0 1px 1px rgba(255,255,255,0.05)" : "none",
                    borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                    overflow: "hidden"
                  }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  {sidebarOpen && (
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse Toggle + Logout */}
          <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: "100%", padding: "10px", borderRadius: "9px", border: "none",
                background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                gap: "8px", fontSize: "0.8rem", fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {sidebarOpen ? <LucideX size={16} /> : <LucideMenu size={16} />}
              {sidebarOpen && <span>Collapse</span>}
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: "100%", padding: "10px", borderRadius: "9px", border: "none",
                background: "rgba(239,68,68,0.1)", color: "#f87171",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                gap: "8px", fontSize: "0.8rem", fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              <LucideLogOut size={16} />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Bar */}
        <header style={{
          height: "64px", background: "white", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", flexShrink: 0,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Vendor Portal</span>
            <LucideChevronRight size={14} color="#94a3b8" />
            <span style={{ color: "#1e293b", fontSize: "0.85rem", fontWeight: 700, textTransform: "capitalize" }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || "Dashboard"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Status Badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 12px", borderRadius: "20px",
              background: "#f0fdf4", border: "1px solid #bbf7d0"
            }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#16a34a" }}>ACTIVE</span>
            </div>
            {/* Vendor ID */}
            <div style={{ padding: "5px 12px", borderRadius: "20px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1d4ed8" }}>{vendorCode || "Vendor"}</span>
            </div>
            {/* Avatar */}
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, color: "white", fontSize: "0.85rem",
              cursor: "pointer"
            }} onClick={() => onTabChange("profile")}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "#f8fafc" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
