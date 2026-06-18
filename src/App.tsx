import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/utils/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import RecruiterDashboard from "./pages/dashboard/Recruiter";
import BossDashboard from "./pages/dashboard/Boss";
import ManagerDashboard from "./pages/dashboard/Manager";
import TLDashboard from "./pages/dashboard/TL";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import GlobalMatchedLeadsPopup from "./components/dashboard/GlobalMatchedLeadsPopup";
import VendorLogin from "./pages/VendorLogin";
import VendorDashboard from "./pages/vendor/VendorDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GlobalMatchedLeadsPopup />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Dashboards */}
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/:tab" element={<SuperAdminDashboard />} />
        <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
        <Route path="/dashboard/recruiter/:tab" element={<RecruiterDashboard />} />
        <Route path="/dashboard/boss" element={<BossDashboard />} />
        <Route path="/dashboard/boss/:tab" element={<BossDashboard />} />
        <Route path="/dashboard/manager" element={<ManagerDashboard />} />
        <Route path="/dashboard/manager/:tab" element={<ManagerDashboard />} />
        <Route path="/dashboard/tl" element={<TLDashboard />} />
        <Route path="/dashboard/tl/:tab" element={<TLDashboard />} />

        {/* Vendor Portal */}
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/:tab" element={<VendorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
