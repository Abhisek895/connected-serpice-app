"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

export default function ProposalPage() {
  const [stage, setStage] = useState(0)

  // This is a static placeholder for the dynamic rendering engine.
  // In a real scenario, we would fetch the theme and text data from the database using the slug ID.

  if (stage === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-rose-200 font-pacifico animate-in fade-in duration-1000 p-4 text-center">
        <h1 className="text-5xl md:text-7xl text-rose-600 drop-shadow-md mb-12">Will you be mine? 💖</h1>
        <div className="flex gap-6">
          <button 
            onClick={() => setStage(2)}
            className="px-10 py-4 bg-rose-500 text-white text-2xl rounded-full shadow-xl shadow-rose-300 hover:scale-110 transition-transform font-sans font-bold"
          >
            Yes! 😍
          </button>
          <button 
            onClick={() => setStage(3)}
            className="px-10 py-4 bg-slate-800 text-white text-2xl rounded-full shadow-xl shadow-slate-300 hover:scale-95 transition-transform font-sans font-bold"
          >
            No 🙈
          </button>
        </div>
      </div>
    )
  }

  if (stage === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-500 font-pacifico animate-in zoom-in duration-500 p-4 text-center text-white">
        <Heart className="w-24 h-24 mb-8 animate-pulse text-white fill-white" />
        <h1 className="text-5xl md:text-7xl drop-shadow-lg">I love you too!</h1>
        <p className="mt-6 text-xl font-sans font-medium text-rose-100">Forever and always. ✨</p>
      </div>
    )
  }

  if (stage === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 font-pacifico animate-in fade-in duration-1000 p-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl drop-shadow-lg text-slate-300 mb-8">Ouch... 💔</h1>
        <button 
          onClick={() => setStage(1)}
          className="px-8 py-3 bg-white text-slate-900 rounded-full font-sans font-bold hover:bg-slate-200 transition"
        >
          Can we try that again?
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-rose-200 font-pacifico p-4 text-center">
      <h1 className="text-4xl md:text-6xl text-rose-600 drop-shadow-md mb-8">Hi there... 😊</h1>
      <p className="text-2xl text-rose-500 mb-12">I have a question for you.</p>
      <button 
        onClick={() => setStage(1)}
        className="px-8 py-4 bg-white text-rose-500 text-xl rounded-full shadow-lg hover:shadow-xl transition-all font-sans font-bold flex items-center gap-2 group"
      >
        <Heart className="w-5 h-5 group-hover:scale-125 transition-transform text-rose-500 fill-rose-500" />
        Tap to continue
      </button>
    </div>
  )
}
