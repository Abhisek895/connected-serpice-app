"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleHeart, Copy, Share2, Camera } from "lucide-react";
import { CopyToast } from "./CopyToast";
import { SaveImageButton } from "./SaveImageButton";

interface RecipientActionBarProps {
  url: string;
  themeColors?: {
    primary: string;
    secondary: string;
  };
  recipientName?: string;
  title?: string;
  position?: "fixed" | "absolute";
}

export function RecipientActionBar({ 
  url, 
  themeColors = { primary: "#e11d48", secondary: "#f43f5e" },
  recipientName,
  title,
  position = "fixed"
}: RecipientActionBarProps) {
  const [showToast, setShowToast] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`I made a surprise for you! 💖\n\nOpen it here: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "A surprise for you! 💖",
          text: "I made something special for you...",
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        className={`${position} bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center justify-between gap-2 overflow-hidden relative">
          {/* Animated gradient border effect */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%]"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  translateX: ["-100%", "200%"]
                }}
              />
            )}
          </AnimatePresence>

          <div className="flex-1 relative z-10">
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-[#25D366] hover:bg-[#1ebd57] text-white py-2.5 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircleHeart size={18} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={handleNativeShare}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center"
              aria-label="Copy Link"
            >
              <Copy size={18} />
            </button>
            
            {/* The Save Image action which uses our off-screen card */}
            <SaveImageButton 
              url={url} 
              themeColors={themeColors} 
              recipientName={recipientName} 
              title={title} 
            />
          </div>
        </div>
      </motion.div>

      <CopyToast 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        url={url} 
      />
    </>
  );
}
