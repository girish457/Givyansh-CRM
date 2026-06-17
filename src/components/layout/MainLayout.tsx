import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function MainLayout({ children, className = "" }: MainLayoutProps) {
  return (
    <div className="flex-layout-wrapper">
      <Navbar />
      <main className={`main-content-flow ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
