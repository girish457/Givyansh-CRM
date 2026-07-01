import React, { useEffect, useState } from "react";

export default function UnreadDot({ sectionKey }: { sectionKey: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ((window as any).hasUnreadSection) {
      setShow((window as any).hasUnreadSection(sectionKey));
    }

    const handleUpdate = () => {
      if ((window as any).hasUnreadSection) {
        setShow((window as any).hasUnreadSection(sectionKey));
      }
    };

    window.addEventListener("givyansh_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("givyansh_notifications_updated", handleUpdate);
    };
  }, [sectionKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).markSectionSeen) {
        (window as any).markSectionSeen(sectionKey);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [sectionKey]);

  if (!show) return null;

  return (
    <span 
      style={{ 
        display: "inline-block", 
        width: "10px", 
        height: "10px", 
        borderRadius: "50%", 
        background: "#ef4444", 
        marginLeft: "8px", 
        boxShadow: "0 0 8px #ef4444",
        verticalAlign: "middle"
      }} 
    />
  );
}
