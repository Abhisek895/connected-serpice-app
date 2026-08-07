"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, Music, Mail, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { recordResponseAction } from "../actions"

type MediaItem = {
  id: string;
  url: string;
  type: string;
};

export type ProposalClientProps = {
  slug: string;
  themeName: string;
  title?: string;
  question: string;
  acceptBtn: string;
  rejectBtn: string;
  loveMessage?: string;
  photoUrl?: string;
  demoId?: string;
  media: MediaItem[];
};

export default function RomanticLoveTemplate({
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
  const [stage, setStage] = useState(0)
  const [showMessage, setShowMessage] = useState(false)

  const hasViewedRef = useRef(false);

  // Track initial view automatically
  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }
  }, [slug]);

  const handleAccept = () => {
    setStage(2);
    recordResponseAction(slug, "ACCEPTED");
  };

  const handleReject = () => {
    setStage(3);
    recordResponseAction(slug, "REJECTED");
  };

  // Separate media into images and audio
  const imageMedia = media.filter(m => m.type === "IMAGE");
  const audioMedia = media.find(m => m.type === "AUDIO");
  const displayPhoto = photoUrl || (imageMedia.length > 0 ? imageMedia[0].url : null);

  // Determine theme classes based on themeName
  let bgClass = "from-pink-100 to-rose-200"
  let textClass = "text-rose-600"
  let btnClass = "bg-rose-500"
  let containerBg = "bg-gradient-to-br"

  if (themeName === "Minimal") {
    bgClass = "bg-white"
    textClass = "text-slate-900"
    btnClass = "bg-slate-900"
    containerBg = ""
  } else if (themeName === "Dark Galaxy") {
    bgClass = "bg-slate-900"
    textClass = "text-white"
    btnClass = "bg-rose-500"
    containerBg = ""
  }

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center overflow-hidden ${containerBg} ${bgClass} font-pacifico p-4 text-center relative`}>

      {/* Background Audio Player */}
      {audioMedia && (
        <div className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md flex items-center gap-2 font-sans text-xs text-slate-700">
          <Music className="w-4 h-4 text-rose-500 animate-spin" />
          <span>Playing Music</span>
          <audio autoPlay loop src={audioMedia.url} className="hidden" />
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* STAGE 0: Photo & Surprise Reveal */}
        {stage === 0 && (
          <motion.div
            key="stage0"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center max-w-lg w-full"
          >
            {/* Display Uploaded Custom Photo Showcase */}
            {displayPhoto && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6 relative group"
              >
                <div className="w-56 h-72 md:w-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white p-1.5 bg-white relative">
                  <img src={displayPhoto} alt="Surprise Memory" className="w-full h-full object-cover rounded-2xl" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-rose-500 text-white p-2.5 rounded-full shadow-lg">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
              </motion.div>
            )}

            <h1 className={`text-3xl md:text-5xl ${textClass} drop-shadow-md mb-4`}>
              {title || "A Surprise For You... 😊"}
            </h1>
            <p className={`text-xl ${textClass} mb-6 font-sans font-medium`}>
              A little surprise from someone who truly cares…
            </p>

            {/* Read Love Message Button */}
            {loveMessage && (
              <div className="mb-6 w-full">
                <button
                  onClick={() => setShowMessage(!showMessage)}
                  className="px-6 py-3 bg-white/90 text-rose-600 rounded-full font-sans font-bold text-sm shadow-md hover:bg-white transition flex items-center justify-center gap-2 mx-auto"
                >
                  <Mail className="w-4 h-4 text-rose-500" /> {showMessage ? "Hide Message 💌" : "Read My Message 💌"}
                </button>

                {showMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-5 bg-white/95 rounded-2xl shadow-xl text-slate-800 font-sans text-sm md:text-base leading-relaxed border border-rose-100 max-w-md mx-auto"
                  >
                    "{loveMessage}"
                  </motion.div>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage(1)}
              className="px-8 py-4 bg-rose-500 text-white text-xl rounded-full shadow-lg transition-shadow hover:shadow-xl font-sans font-bold flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6 fill-white" />
              Tap to continue
            </motion.button>
          </motion.div>
        )}

        {/* STAGE 1: Proposal Question */}
        {stage === 1 && (
          <motion.div
            key="stage1"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center w-full max-w-2xl"
          >
            <h1 className={`text-5xl md:text-7xl ${textClass} drop-shadow-md mb-16 leading-tight`}>
              {question || "Will you be mine? 💖"}
            </h1>
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAccept}
                className={`px-12 py-5 ${btnClass} text-white text-2xl rounded-full shadow-xl font-sans font-bold w-full sm:w-auto`}
              >
                {acceptBtn || "Yes! 😍"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 0.9, x: [0, -10, 10, -10, 10, 0] }}
                whileTap={{ scale: 0.8 }}
                onClick={handleReject}
                className="px-12 py-5 bg-slate-800 text-white text-2xl rounded-full shadow-xl font-sans font-bold w-full sm:w-auto transition-colors hover:bg-slate-700"
              >
                {rejectBtn || "No 🙈"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: Accepted Response */}
        {stage === 2 && (
          <motion.div
            key="stage2"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1 }}
            className="flex flex-col items-center justify-center text-center p-8 bg-rose-500 rounded-3xl shadow-2xl text-white border-4 border-white/20 max-w-lg"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Heart className="w-24 h-24 mb-8 text-white fill-white drop-shadow-lg" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl drop-shadow-lg mb-4">I love you too!</h1>
            <p className="text-2xl font-sans font-medium text-rose-100">Forever and always. ✨</p>
          </motion.div>
        )}

        {/* STAGE 3: Rejected Response */}
        {stage === 3 && (
          <motion.div
            key="stage3"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center p-12 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 text-white"
          >
            <h1 className="text-5xl md:text-7xl drop-shadow-lg text-slate-300 mb-8">Ouch... 💔</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage(1)}
              className="px-8 py-4 bg-white text-slate-900 text-lg rounded-full font-sans font-bold shadow-lg"
            >
              Can we try that again?
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
