"use client"
import { useState } from "react"
import { Sparkles, Image as ImageIcon, Music, Type, CheckCircle, ArrowRight } from "lucide-react"

export default function BuilderPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 font-sans px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Wizard Header */}
        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-pacifico tracking-wider text-rose-400">OurStory Builder</h1>
            <p className="text-slate-400 text-sm mt-1">Design your digital memory step by step.</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-rose-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-8 md:p-12 min-h-[400px]">
          
          {/* Step 1: Theme */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-rose-500" /> Choose a Theme
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="border-2 border-rose-500 bg-rose-50 rounded-2xl p-6 text-left hover:shadow-md transition">
                  <h3 className="font-bold text-slate-900 text-lg">Romantic</h3>
                  <p className="text-slate-500 text-sm mt-2">Soft pinks, floating hearts, and elegant fonts.</p>
                </button>
                <button className="border-2 border-slate-100 bg-white rounded-2xl p-6 text-left hover:border-slate-300 transition">
                  <h3 className="font-bold text-slate-900 text-lg">Minimal</h3>
                  <p className="text-slate-500 text-sm mt-2">Clean, white space with bold typography.</p>
                </button>
                <button className="border-2 border-slate-100 bg-slate-900 text-white rounded-2xl p-6 text-left hover:border-slate-700 transition">
                  <h3 className="font-bold text-white text-lg">Dark Galaxy</h3>
                  <p className="text-slate-400 text-sm mt-2">Deep blacks, glowing stars, and neon accents.</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Media */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="text-rose-500" /> Upload Media
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer">
                  <ImageIcon className="w-10 h-10 mb-4" />
                  <p className="font-medium">Upload Photos</p>
                  <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer">
                  <Music className="w-10 h-10 mb-4" />
                  <p className="font-medium">Upload Background Music</p>
                  <p className="text-xs mt-1">MP3 up to 10MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Text & Question */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Type className="text-rose-500" /> Customization
              </h2>
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">The Big Question (or Message)</label>
                  <input type="text" placeholder="Will you be mine? 💖" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Accept Button</label>
                    <input type="text" placeholder="Yes! 😍" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Reject Button</label>
                    <input type="text" placeholder="No 🙈" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success/Fail Screens */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="text-rose-500" /> Review & Publish
              </h2>
              <div className="bg-green-50 text-green-700 border border-green-200 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-2">Ready to go!</h3>
                <p>Your beautiful digital memory page is fully configured. Upgrade to Premium for a custom URL and no watermark.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition">
                  Publish for Free
                </button>
                <button className="flex-1 bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-rose-600 transition shadow-rose-200">
                  Upgrade to Premium (₹99)
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between">
          <button 
            disabled={step === 1} 
            onClick={() => setStep(step - 1)}
            className="px-6 py-2 rounded-xl font-medium text-slate-500 hover:bg-slate-200 disabled:opacity-50 transition"
          >
            Back
          </button>
          {step < 4 && (
            <button 
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-xl font-bold bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 transition"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
