import { Link } from "react-router-dom";
import { LucideZap, LucideMail, LucidePhone, LucideMapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo.png" alt="Givyansh CRM" style={{ height: "65px", width: "auto" }} />
            </Link>
            <p className="footer-desc">
              High-velocity recruitment CRM built for speed and scaling across thousands of tenants.
            </p>
            <div className="footer-socials">
               <a href="#" className="social-box instagram" aria-label="Instagram">
                 <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.168-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
               </a>
               <a href="#" className="social-box telegram" aria-label="Telegram">
                 <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.146l-2.003 9.464c-.149.659-.541.823-1.091.515l-3.051-2.246-1.472 1.417c-.163.163-.3.298-.614.298l.219-3.102 5.645-5.1c.245-.218-.054-.338-.379-.121l-6.979 4.393-3.007-.942c-.654-.204-.667-.654.137-.967l11.75-4.528c.544-.203 1.02.123.864.811z"/></svg>
               </a>
                <a href="#" className="social-box whatsapp" aria-label="WhatsApp">
                  <svg viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.3c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.4-29.4-28.1-63.3-28.1-98.2 0-101.7 82.8-184.5 184.5-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54.1 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm111.4-153c-6.1-3-36.1-17.8-41.7-19.8-5.6-2-9.7-3-13.8 3-4.1 6-15.8 19.8-19.4 23.8-3.6 4-7.1 4.5-13.3 1.5-6.1-3-25.8-9.5-49.1-30.4-18.1-16.1-30.3-36-33.9-42.1-3.6-6.1-.4-9.3 2.6-12.3 2.7-2.7 6.1-7.1 9.1-10.7 3-3.6 4-6.1 6-10.2 2-4.1 1-7.6-.5-10.7-1.5-3-13.8-33.3-18.9-45.7-5-12.1-10-10.4-13.8-10.6-3.5-.2-7.6-.2-11.7-.2-4.1 0-10.7 1.5-16.3 7.6-5.6 6.1-21.4 20.9-21.4 50.8 0 29.9 21.7 58.7 24.8 62.8 3.1 4 42.7 65.2 103.5 91.4 14.5 6.2 26 9.9 34.9 12.7 14.6 4.6 27.9 3.9 38.4 2.4 11.7-1.7 36.1-14.7 41.2-28.9s5.1-26.4 3.6-28.9c-1.5-2.5-5.6-4.1-11.7-7.1z"/></svg>
                </a>
               <a href="#" className="social-box youtube" aria-label="YouTube">
                 <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
               </a>
               <a href="#" className="social-box linkedin" aria-label="LinkedIn">
                 <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
               </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/pricing">Get Started</Link></li>
              <li><Link to="/login">Login Now</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Office Location</h4>
            <div className="contact-list">
               <div className="contact-item"><LucideMapPin size={16} /> 123 Recruit Blvd, SV, CA</div>
               <div className="contact-item"><LucideMail size={16} /> hello@givyanshcrm.com</div>
               <div className="contact-item"><LucidePhone size={16} /> +1 (555) 123-4567</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Givyansh CRM Inc. Built for Scalable Recruitment.</p>
          <div className="legal-links">
             <Link to="/privacy-policy">Privacy Policy</Link>
             <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
