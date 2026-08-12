"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OurStoryWatermarkProps {
  /** "dark" = frosted dark glass (default) — for romantic/dark templates
   *  "light" = frosted light glass — for light-background templates like DatePlanner */
  variant?: "dark" | "light";
  /** UTM source to distinguish which template referred the click */
  templateId?: string;
}

export default function OurStoryWatermark({
  variant = "dark",
  templateId = "shared_page",
}: OurStoryWatermarkProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration safety
  useEffect(() => {
    setMounted(true);
    // Auto-collapse after 4 seconds so it never blocks UI
    const timer = setTimeout(() => setCollapsed(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const url = `https://ourstory.love/?ref=watermark&utm_source=${templateId}&utm_medium=badge&utm_campaign=viral`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!mounted) return null;

  const isDark = variant === "dark";

  const badgeBase =
    "fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 cursor-pointer select-none border transition-all duration-300 ease-out focus:outline-none";

  const colorClass = isDark
    ? "bg-black/40 border-white/15 text-white hover:bg-rose-500/70 hover:border-rose-400/30 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
    : "bg-white/60 border-slate-200/60 text-slate-700 hover:bg-rose-50/90 hover:border-rose-300/50 shadow-[0_4px_24px_rgba(0,0,0,0.12)]";

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={() => setCollapsed(false)}
      onHoverEnd={() => {
        // Re-collapse after 2s on mouse leave
        setTimeout(() => setCollapsed(true), 2000);
      }}
      onTap={() => setCollapsed(false)}
      aria-label="Made with OurStory — Create your own"
      className={`${badgeBase} ${colorClass}`}
      style={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRadius: "999px",
      }}
      animate={{
        paddingLeft: collapsed ? "10px" : "14px",
        paddingRight: collapsed ? "10px" : "16px",
        paddingTop: "8px",
        paddingBottom: "8px",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
    >
      {/* Heart icon — always visible */}
      <motion.span
        animate={{ scale: collapsed ? 1.2 : 1 }}
        transition={{ duration: 0.3 }}
        className="text-base leading-none"
        style={{ display: "block" }}
      >
        💖
      </motion.span>

      {/* Text — hidden when collapsed */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            key="badge-text"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="text-xs font-bold tracking-wide whitespace-nowrap overflow-hidden"
            style={{ display: "block" }}
          >
            Made with OurStory
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
