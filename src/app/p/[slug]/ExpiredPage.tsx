"use client";

import { motion } from "framer-motion";
import { HeartCrack, Home } from "lucide-react";
import Link from "next/link";

export default function ExpiredPage() {
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4 selection:bg-rose-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl shadow-rose-900/5 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-bl-full opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-tr-full opacity-50 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <HeartCrack className="w-10 h-10 text-rose-500" />
          </motion.div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            This experience has expired 💔
          </h1>
          
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            The time limit for this digital memory has passed. Ask them to create a new one! 💌
          </p>
          
          <Link
            href="/"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2 group"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Go to OurStory Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
