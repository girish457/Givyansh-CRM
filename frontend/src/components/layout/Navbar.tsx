import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LucideMenu, LucideX, LucideSearch } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Our Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Blogs", href: "/blogs" },
];

export default function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (href: string) => {
    if (location.pathname === href) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="container nav-content">
        <Link to="/" className="logo-v2">
          <img src="/logo.png" alt="Givyansh CRM" />
        </Link>

        {/* Desktop Search */}
        <div className="nav-search desktop-only">
          <LucideSearch className="search-icon" size={18} />
          <input type="text" placeholder="Search for features, tools..." />
        </div>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`nav-link ${location.pathname === link.href ? "active" : ""}`}
              onClick={() => handleLinkClick(link.href)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="nav-auth">
            <Link to="/login" className="btn-primary login-btn">
              Login
            </Link>
            <Link to="/pricing" className="btn-secondary signup-btn">
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <LucideX /> : <LucideMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu glass">
          <div className="mobile-search">
            <input type="text" placeholder="Search..." />
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`nav-link ${location.pathname === link.href ? "active" : ""}`}
              onClick={() => handleLinkClick(link.href)}
            >
              {link.name}
            </Link>
          ))}
          <div className="mobile-auth">
            <Link to="/login" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
