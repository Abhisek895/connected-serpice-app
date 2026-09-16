"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, MessageCircleHeart } from "lucide-react";

interface CopyToastProps {
  isVisible: boolean;
  onClose: () => void;
  url: string;
}

export function CopyToast({ isVisible, onClose, url }: CopyToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`I made a surprise for you! 💖\n\nOpen it here: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
        >
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3 text-white">
              <div className="h-10 w-10 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center shrink-0">
                <Check size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">Link Copied!</p>
                <p className="text-xs text-slate-400">Ready to share your surprise</p>
              </div>
            </div>
            
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-[#25D366] hover:bg-[#1ebd57] text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircleHeart size={18} />
              Share on WhatsApp Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
