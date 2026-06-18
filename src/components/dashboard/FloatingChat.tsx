import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LucideMessageSquare, LucideX } from "lucide-react";
import GlobalChat from "./GlobalChat";

interface FloatingChatProps {
  user: {
    id: number;
    name: string;
    role: string;
    email?: string;
    companyId: number;
  } | null;
  role: string;
}

export default function FloatingChat({ user, role }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mentionCount, setMentionCount] = useState(0);

  // Track background messages when the chat is closed
  useEffect(() => {
    if (isOpen || !user) return;

    const checkNewMessages = async () => {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          const lastReadId = parseInt(localStorage.getItem(`last_read_message_id_${user.id}`) || "0");
          const unreadMessages = data.filter((m: any) => m.senderId !== user.id && m.id > lastReadId);
          const unread = unreadMessages.length;

          const tag = `@${user.name.toLowerCase()}`;
          const emailTag = user.email ? `@${user.email.toLowerCase()}` : "";
          let mentions = 0;
          unreadMessages.forEach((m: any) => {
            const content = m.message.toLowerCase();
            let isReplyToMe = false;
            if (m.replyToMessage) {
              try {
                const parent = JSON.parse(m.replyToMessage);
                if (parent.senderId === user.id || parent.senderName === user.name) {
                  isReplyToMe = true;
                }
              } catch (e) {}
            }
            if (content.includes(tag) || (emailTag && content.includes(emailTag)) || isReplyToMe) {
              mentions++;
            }
          });

          setUnreadCount(unread);
          setMentionCount(mentions);
        }
      } catch (err) {
        console.error("Error checking background chat count:", err);
      }
    };

    // Run check on initial mount/close
    checkNewMessages();

    // Poll count every 20 seconds
    const interval = setInterval(checkNewMessages, 20000);
    return () => clearInterval(interval);
  }, [isOpen, user]);

  const handleMessagesCountChange = (unread: number, mentions: number) => {
    if (isOpen && user) {
      setUnreadCount(unread);
      setMentionCount(mentions);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setMentionCount(0);
    }
  };

  if (!user) return null;

  return (
    <div className="floating-chat-container">
      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50, x: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="floating-chat-window"
          >
            <GlobalChat
              currentUser={user}
              height="100%"
              onClose={() => setIsOpen(false)}
              onMessagesCountChange={handleMessagesCountChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={toggleChat}
        className="floating-chat-trigger"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <LucideX size={24} /> : <LucideMessageSquare size={24} />}
        
        {/* Unread Count Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="floating-chat-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Mention Count Badge */}
        {!isOpen && mentionCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-4px",
            left: "-4px",
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "white",
            fontSize: "0.68rem",
            fontWeight: 900,
            borderRadius: "10px",
            minWidth: "22px",
            height: "18px",
            padding: "0 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
            zIndex: 10
          }}>
            @{mentionCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
