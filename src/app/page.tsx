import Link from "next/link";
import { Heart, Sparkles, Image as ImageIcon, Music, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-rose-500 font-pacifico tracking-wider">OurStory</h1>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 rounded-full font-medium text-slate-600 hover:text-slate-900 transition">
            Login
          </Link>
          <Link href="/dashboard" className="px-6 py-2 rounded-full font-medium bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600 transition">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 mt-12 mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-600 text-sm font-semibold mb-8">
          <Sparkles className="w-4 h-4" />
          <span>The #1 No-Code Digital Memory Builder</span>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl leading-tight mb-6">
          Create unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-600">digital memories</span> for your loved ones.
        </h2>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10">
          Proposals, Birthdays, Anniversaries. Design beautiful, interactive web pages in minutes. Add music, photos, and magical effects with zero code.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard/builder" className="px-8 py-4 rounded-full font-bold bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition flex items-center gap-2 text-lg">
            Create Your First Page <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        
        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mt-24">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Stunning Themes</h3>
            <p className="text-slate-500">Choose from Romantic, Minimal, or Dark themes tailored for any occasion.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-6">
              <Music className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Audio & Video</h3>
            <p className="text-slate-500">Upload your favorite song to play in the background as they scroll.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Track Reactions</h3>
            <p className="text-slate-500">Get notified instantly when they open your page or click "YES!".</p>
          </div>
        </div>
      </main>
    </div>
  );
}
