import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VendorLayout from "../../components/vendor/VendorLayout";
import VendorDashboardHome from "../../components/vendor/VendorDashboardHome";
import VendorProfile from "../../components/vendor/VendorProfile";
import VendorCandidates from "../../components/vendor/VendorCandidates";
import VendorJobs from "../../components/vendor/VendorJobs";
import VendorReports from "../../components/vendor/VendorReports";

export default function VendorDashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const activeTab = tab || "dashboard";

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("vendor_token");
      if (!token) {
        navigate("/vendor-login");
        return;
      }

      // Load cached vendor data immediately
      const cached = localStorage.getItem("vendor_data");
      if (cached) {
        try { setVendorData(JSON.parse(cached)); } catch (e) {}
      }

      // Verify token is still valid
      try {
        const res = await fetch("/api/vendor/me", {
          headers: { "Authorization": `VendorBearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setVendorData(data);
          localStorage.setItem("vendor_data", JSON.stringify(data));
        } else {
          // Token expired or invalid
          localStorage.removeItem("vendor_token");
          localStorage.removeItem("vendor_data");
          navigate("/vendor-login");
          return;
        }
      } catch (e) {
        // Network error — use cached data if available
        console.warn("Vendor auth check failed, using cached data:", e);
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [navigate]);

  const handleTabChange = (newTab: string) => {
    navigate(`/vendor/${newTab}`);
  };

  if (!authChecked && !vendorData) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f8fafc",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px",
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            margin: "0 auto 16px", display: "flex", alignItems: "center",
            justifyContent: "center", animation: "pulse 1.5s ease-in-out infinite"
          }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "white" }}>G</span>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 600 }}>Loading Vendor Portal...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <VendorDashboardHome />;
      case "candidates": return <VendorCandidates />;
      case "jobs": return <VendorJobs />;
      case "reports": return <VendorReports />;
      case "profile": return <VendorProfile />;
      default: return <VendorDashboardHome />;
    }
  };

  return (
    <VendorLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      vendorData={vendorData}
    >
      {renderContent()}
    </VendorLayout>
  );
}
