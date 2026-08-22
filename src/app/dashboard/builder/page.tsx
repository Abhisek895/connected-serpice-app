"use client"
import { useState, Suspense, useEffect } from "react"
import { Sparkles, Image as ImageIcon, Music, Type, CheckCircle, ArrowRight, Loader2, AlertCircle, Bookmark, Heart, Mail } from "lucide-react"
import { createDraftEvent, updateEventCustomData, uploadMedia, publishEvent, checkPaymentAccess } from "./actions"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

function BuilderWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const stepParam = searchParams.get('step')
  const step = stepParam ? parseInt(stepParam, 10) : 1
  const demoId = searchParams.get('demoId') || "custom"

  const setStep = (newStep: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', newStep.toString())
    router.push(pathname + '?' + params.toString(), { scroll: false })
  }

  const [eventId, setEventId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function verifyAccess() {
      if (demoId !== "custom") {
        const hasAccess = await checkPaymentAccess(demoId);
        if (!hasAccess) {
          setError("Access denied. Please complete payment to use this template.");
          setIsLoading(false);
          setTimeout(() => router.push("/dashboard"), 2500);
          return;
        }
      }
      setIsLoading(false);
    }
    verifyAccess();
  }, [demoId, router]);
  
  const [title, setTitle] = useState("")
  const [theme, setTheme] = useState("Romantic")
  const [question, setQuestion] = useState("")
  const [acceptBtn, setAcceptBtn] = useState("")
  const [rejectBtn, setRejectBtn] = useState("")
  const [loveMessage, setLoveMessage] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)



  const handleNextStep = async () => {
    setIsLoading(true)
    setError(null)

    // Required validation for Romantic Love Surprise customization
    if (step === 1 && !title.trim()) {
      setError("Please enter an Event Title / Name before proceeding.");
      setIsLoading(false);
      return;
    }

    if (step === 2 && (!loveMessage.trim() || (!photoUrl && false))) {
      // Allow proceeding if loveMessage is filled out
    }

    try {
      if (step === 1) {
        let currentId = eventId;
        if (!currentId) {
          const res = await createDraftEvent(theme);
          if (res.success) {
            currentId = res.eventId;
            setEventId(res.eventId);
          } else {
            setError("Failed to create draft event.");
            setIsLoading(false);
            return;
          }
        }
        await updateEventCustomData(currentId, { 
          title: title || "Proposal for Priya", 
          question, 
          acceptBtn, 
          rejectBtn,
          loveMessage,
          photoUrl
        });
        setStep(2);
      } else if (step === 2) {
        let currentId = eventId;
        if (currentId) {
          await updateEventCustomData(currentId, { 
            title: title || "Proposal for Priya", 
            question, 
            acceptBtn, 
            rejectBtn,
            loveMessage,
            photoUrl
          });
        }
        setStep(3);
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An unexpected error occurred.")
    }
    setIsLoading(false)
  }

  const handlePublish = async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);

    // Enforce required Love Message and Title before publishing
    if (!loveMessage.trim()) {
      setError("Please enter a custom Love Letter Message before publishing.");
      setIsLoading(false);
      return;
    }

    try {
      // Ensure customData has all required fields saved to DB
      await updateEventCustomData(eventId, { 
        title: title || "Proposal for Priya", 
        question, 
        acceptBtn, 
        rejectBtn,
        loveMessage,
        photoUrl,
        demoId
      });
      const res = await publishEvent(eventId);
      if (res.success && res.slug) {
        setPublishedSlug(res.slug);
      } else {
        setError("Failed to publish event.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    }
    setIsLoading(false);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    setIsLoading(true);
    setError(null);
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read audio/photo file."));
        reader.readAsDataURL(file);
      });
      setPhotoUrl(dataUrl);
    } catch (err: any) {
       console.error(err);
       setError("Failed to process media file.");
    }
    setIsLoading(false);
  }

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Wizard Header */}
      <div className="bg-slate-900 px-5 sm:px-8 py-5 sm:py-6 text-white flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold font-pacifico tracking-wider text-rose-400">OurStory Builder</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Design your digital memory step by step.</p>
        </div>
        <div className="flex gap-2 relative z-10">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              className={`w-3 h-3 rounded-full ${step >= i ? 'bg-rose-500' : 'bg-slate-700'}`}
              animate={{ scale: step === i ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-8 mb-0 flex items-center gap-3 text-red-700 rounded-r-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Wizard Body */}
      <div className="p-5 sm:p-8 md:p-12 min-h-[400px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Customization & Integrated Theme Selector */}
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Type className="text-rose-500 w-5 h-5 shrink-0" /> Customize Your Proposal & Theme
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Enter your event title, custom message, and select your visual style.</p>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-rose-500" /> Event Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Proposal for Priya" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">The Big Question (or Message)</label>
                  <input 
                    type="text" 
                    value={question} 
                    onChange={e => setQuestion(e.target.value)} 
                    placeholder="Will you be mine? 💖" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow" 
                  />
                </div>

                {/* REQUIRED FIELD 2: Love Letter Message */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-rose-500" /> Love Letter Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={loveMessage} 
                    onChange={e => setLoveMessage(e.target.value)} 
                    placeholder="Write your special love message or surprise letter here... (e.g. A little surprise from someone who truly cares…)" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow text-sm" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Accept Button Text</label>
                    <input 
                      type="text" 
                      value={acceptBtn} 
                      onChange={e => setAcceptBtn(e.target.value)} 
                      placeholder="Yes! 😍" 
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow text-base" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Reject Button Text</label>
                    <input 
                      type="text" 
                      value={rejectBtn} 
                      onChange={e => setRejectBtn(e.target.value)} 
                      placeholder="No 🙈" 
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow text-base" 
                    />
                  </div>
                </div>
              </div>

              {/* Theme Pill Selector */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Select Visual Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Romantic', desc: 'Soft pinks & hearts' },
                    { name: 'Minimal', desc: 'Clean white typography' },
                    { name: 'Dark Galaxy', desc: 'Glowing cosmic stars' }
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.name}
                      onClick={() => setTheme(t.name)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        theme === t.name 
                          ? 'border-rose-500 bg-rose-50/70 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Media Upload */}
          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="text-rose-500" /> Custom Photo & Music Showcase <span className="text-rose-500">*</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">Upload a custom photo (required for Romantic Love Surprise) and optional background music.</p>
              </div>

              {/* Direct Photo URL Input or File Upload */}
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" /> Custom Photo Image URL (Optional or Upload File Below)
                  </label>
                  <input 
                    type="url" 
                    value={photoUrl} 
                    onChange={e => setPhotoUrl(e.target.value)} 
                    placeholder="https://example.com/photo.jpeg or upload file below" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow text-sm" 
                  />
                </div>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`border-2 border-dashed border-rose-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${isLoading ? 'bg-slate-100 opacity-50' : 'bg-rose-50/50 hover:bg-rose-50 hover:border-rose-400 text-rose-500'}`}>
                  {isLoading ? <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 animate-spin text-rose-500" /> : <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4" />}
                  <p className="font-bold text-slate-800 text-sm sm:text-base">{isLoading ? 'Uploading...' : 'Upload Custom Photo *'}</p>
                  <p className="text-xs mt-1 text-slate-500">PNG, JPG up to 5MB</p>
                  {photoUrl && <p className="text-xs mt-2 font-bold text-green-600">✓ Photo Selected & Uploaded</p>}
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'image')} disabled={isLoading} />
                </motion.label>

                <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`border-2 border-dashed border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${isLoading ? 'bg-slate-100 opacity-50' : 'hover:bg-slate-50 hover:border-slate-300 text-slate-400'}`}>
                  {isLoading ? <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 animate-spin text-rose-500" /> : <Music className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4" />}
                  <p className="font-medium text-slate-700 text-sm sm:text-base">{isLoading ? 'Uploading...' : 'Upload Background Music'}</p>
                  <p className="text-xs mt-1 text-slate-400">MP3 up to 10MB</p>
                  <input type="file" accept="audio/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'audio')} disabled={isLoading} />
                </motion.label>
              </div>

              {photoUrl && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                  <img src={photoUrl} alt="Preview" className="w-16 h-20 object-cover rounded-xl border" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Custom Photo Ready!</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-xs">{photoUrl}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Review & Publish */}
          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="text-rose-500" /> Review & Publish
              </h2>
              
              {publishedSlug ? (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-50 text-green-700 border border-green-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Successfully Published!</h3>
                  <p className="mb-4">Your digital memory page <strong>"{title || 'Proposal for Priya'}"</strong> is live in SQLite / MySQL database.</p>
                  <div className="flex gap-3">
                    <Link href={`/p/${publishedSlug}`} target="_blank" className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200">
                      View Live Page <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-colors shadow-md">
                      Go to Dashboard
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <>
                <div className="bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-2">Ready to publish "{title || 'Proposal for Priya'}"!</h3>
                  <p className="text-sm">Configured with <strong>{theme}</strong> theme, custom photo, and love letter message saved in database.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePublish} disabled={isLoading} className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100">
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isLoading ? 'Publishing...' : '🚀 Publish & Go Live'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-rose-600 transition-all shadow-rose-200 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" /> Upgrade to Premium (₹99)
                  </motion.button>
                </div>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Wizard Footer Controls — sticky on mobile */}
      <div className="bg-slate-50 border-t border-slate-100 px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center sticky bottom-0">
        <button 
          disabled={step === 1 || isLoading || !!publishedSlug} 
          onClick={() => setStep(step - 1)}
          className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          Back
        </button>
        {step < 3 && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            onClick={handleNextStep}
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:scale-100 shadow-md"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Next Step'} 
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        )}
      </div>

    </div>
  )
}

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-6 sm:py-12 px-3 sm:px-6 font-sans">
      <Suspense fallback={
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center min-h-[600px]">
           <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        </div>
      }>
        <BuilderWizard />
      </Suspense>
    </div>
  )
}
