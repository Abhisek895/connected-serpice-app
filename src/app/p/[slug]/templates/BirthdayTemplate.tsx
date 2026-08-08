"use client"

import { useState, useEffect, useRef } from "react"
import { Gift, Cake, Sparkles, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { recordResponseAction } from "../actions"
import type { ProposalClientProps } from "./RomanticLoveTemplate"

export default function BirthdayTemplate({
  slug,
  themeName,
  title,
  question,
  acceptBtn,
  rejectBtn,
  loveMessage,
  photoUrl,
  media
}: ProposalClientProps) {
  const [stage, setStage] = useState(0) // 0: Cover, 1: Message

  const hasViewedRef = useRef(false);

  // Track initial view automatically
  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }
  }, [slug]);

  const handleOpen = () => {
    setStage(1);
    recordResponseAction(slug, "ACCEPTED");
  };

  // Separate media into images and audio
  const imageMedia = media.filter(m => m.type === "IMAGE");
  const audioMedia = media.find(m => m.type === "AUDIO") || { url: "/demos/birthday-wish/hbd.mp3" };
  const displayPhoto = photoUrl || (imageMedia.length > 0 ? imageMedia[0].url : "/demos/birthday-wish/s0.jpeg");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Background Audio Player */}
      {audioMedia && stage > 0 && (
        <audio autoPlay loop src={audioMedia.url} className="hidden" />
      )}

      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-amber-300 opacity-50"><Cake className="w-12 h-12" /></div>
      <div className="absolute bottom-20 right-10 text-rose-300 opacity-50"><Gift className="w-16 h-16" /></div>

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="cover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-amber-200"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 blur-xl opacity-30 rounded-full animate-pulse" />
                <Gift className="w-20 h-20 text-amber-500 relative z-10" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
              {title || "Happy Birthday!"}
            </h1>

            <p className="text-slate-600 mb-8 font-medium">
              You have a special surprise waiting for you...
            </p>

            <button
              onClick={handleOpen}
              className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Open Your Present
            </button>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-amber-200 relative overflow-hidden"
          >
            {/* Confetti effect background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply" />

            <div className="relative z-10">
              {displayPhoto && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-40 h-40 md:w-56 md:h-56 mx-auto mb-8 rounded-2xl overflow-hidden shadow-lg border-4 border-white rotate-3 hover:rotate-0 transition-transform duration-300"
                >
                  <img src={displayPhoto} alt="Birthday Star" className="w-full h-full object-cover object-[center_top]" />
                </motion.div>
              )}

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold text-amber-600 mb-4 font-pacifico"
              >
                {question || "Wishing you the happiest birthday!"}
              </motion.h2>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-6"
              >
                <p className="text-slate-700 leading-relaxed text-lg font-medium">
                  {loveMessage || "May all your dreams come true. You deserve all the happiness in the world!"}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center"
              >
                <Heart className="w-8 h-8 text-rose-500 animate-bounce" fill="currentColor" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
