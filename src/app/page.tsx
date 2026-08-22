import Link from "next/link";
import { Heart, Sparkles, Image as ImageIcon, Music, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OurStory | Digital Memories & Proposals",
  description:
    "Create beautiful, interactive proposal & memory pages in minutes — add music, photos, and magical effects with zero code. 8+ templates ready to share on WhatsApp!",
  openGraph: {
    title: "OurStory | Digital Memories & Proposals 💖",
    description:
      "Create beautiful, interactive proposal & memory pages in minutes. 8+ templates for proposals, birthdays, apologies & more!",
    siteName: "OurStory 💖",
    type: "website",
    url: "https://ourstory.love",
    images: [
      {
        url: "https://ourstory.love/og-default.png",
        width: 1200,
        height: 630,
        alt: "OurStory — Digital Memories & Proposals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OurStory | Digital Memories & Proposals 💖",
    description: "Create beautiful interactive proposal & memory pages. 8+ templates!",
    images: ["https://ourstory.love/og-default.png"],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-rose-50/30 flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden">

      {/* ========================================================= */}
      {/* 1. HEADER / NAVBAR (Fully Responsive across all devices)  */}
      {/* ========================================================= */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl sm:text-3xl font-bold text-rose-500 font-pacifico tracking-wider group-hover:scale-105 transition-transform">
            OurStory
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="px-3.5 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm bg-rose-500 text-white shadow-md shadow-rose-200 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-300 transition-all flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                           */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-6 sm:pt-12 pb-16 sm:pb-24 max-w-6xl mx-auto w-full">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-rose-100/80 border border-rose-200/50 text-rose-600 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 fill-rose-400" />
          <span>The #1 No-Code Digital Memory &amp; Proposal Builder</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mb-4 sm:mb-6">
          Create unforgettable{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600">
            digital memories
          </span>{" "}
          for your loved ones.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-8 sm:mb-10 px-2">
          Proposals, Birthdays, Anniversaries. Design beautiful, interactive web pages in minutes. Add music, photos, and magical effects with zero code.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard/builder"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-bold bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
          >
            <span>Create Your First Page</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-full font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-base text-center shadow-xs"
          >
            Explore Pre-Made Demos
          </Link>
        </div>

        {/* Social Proof Badges */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Instant Shareable Links
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" /> Zero Coding Required
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-rose-500 fill-rose-500" /> Real-time Reaction Tracker
          </span>
        </div>

        {/* ========================================================= */}
        {/* 3. LIVE PRODUCT PREVIEW                                   */}
        {/* ========================================================= */}
        <div className="mt-12 sm:mt-16 w-full max-w-xs mx-auto">
          <div className="relative">
            {/* Phone frame */}
            <div className="bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl shadow-slate-900/40 ring-1 ring-slate-700/50">
              <div className="bg-gradient-to-b from-rose-50 via-white to-pink-50 rounded-[2rem] overflow-hidden" style={{ minHeight: '340px' }}>
                {/* Notch */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-20 h-5 bg-slate-900 rounded-full" />
                </div>
                {/* Mock proposal page content */}
                <div className="px-5 pt-3 pb-6 text-center">
                  <div className="text-3xl mb-2">💖</div>
                  <h3 className="text-sm font-pacifico text-rose-500 mb-1">OurStory</h3>
                  <p className="text-[11px] text-slate-600 font-semibold mb-3">A surprise for you, Priya ✨</p>
                  <div className="bg-white/80 rounded-2xl p-3 mb-3 border border-rose-100 shadow-xs">
                    <p className="text-[10px] text-slate-700 leading-relaxed italic">&ldquo;Every moment with you is a memory I want to keep forever. Will you be mine? 💕&rdquo;</p>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 mb-3">Will you be my girlfriend? 🥺</p>
                  <div className="flex gap-2">
                    <div className="flex-1 py-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-xl shadow-sm">YES! 😍</div>
                    <div className="flex-1 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-xl">No 🙈</div>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1 text-[8px] text-slate-400">
                    <span>💖 Made with OurStory</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -right-4 top-8 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg shadow-emerald-400/40 rotate-3">
              ✅ She said YES!
            </div>
            <div className="absolute -left-4 bottom-12 bg-white border border-rose-100 text-rose-600 text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-md -rotate-2">
              👀 Just Opened!
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. TEMPLATE COUNT / VARIETY STRIP                         */}
        {/* ========================================================= */}
        <div className="w-full mt-14 sm:mt-20 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 p-px">
          <div className="bg-white rounded-3xl px-6 sm:px-10 py-6 sm:py-8">
            <p className="text-xs sm:text-sm font-semibold text-rose-500 uppercase tracking-widest mb-4 text-center">
              ✨ 8 Ready-To-Use Templates — More Added Every Week
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { emoji: "🥺", label: "Cute Forgive Me", color: "bg-pink-50 text-pink-700 border-pink-200" },
                { emoji: "💖", label: "3D Glowing Heart", color: "bg-rose-50 text-rose-700 border-rose-200" },
                { emoji: "💕", label: "She Can&apos;t Say No", color: "bg-red-50 text-red-700 border-red-200" },
                { emoji: "🎁", label: "Romantic Surprise", color: "bg-purple-50 text-purple-700 border-purple-200" },
                { emoji: "🎂", label: "Birthday Wish", color: "bg-amber-50 text-amber-700 border-amber-200" },
                { emoji: "🌸", label: "Cute Mey Proposal", color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
                { emoji: "🌆", label: "Kolkata Date Night", color: "bg-sky-50 text-sky-700 border-sky-200" },
                { emoji: "🌿", label: "Jalpaiguri Date", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              ].map((t) => (
                <div key={t.label} className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold ${t.color}`}>
                  <span className="text-base sm:text-lg">{t.emoji}</span>
                  <span className="leading-tight" dangerouslySetInnerHTML={{ __html: t.label }} />
                </div>
              ))}
            </div>
            <div className="mt-5 text-center">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                Browse all templates <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. FEATURE CARDS GRID                                     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl w-full mt-12 sm:mt-16 text-left">

          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-100/80 text-rose-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">8+ Stunning Themes</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Choose from magical templates — proposals, apologies, birthdays, date planners and more. New themes added weekly!
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100/80 text-purple-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Audio &amp; Memories</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Add background romantic audio tracks (Tum Se Hi, LoveSong), photo slideshow galleries, and love notes.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-pink-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group sm:col-span-2 md:col-span-1">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-100/80 text-pink-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-pink-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Real-Time Analytics</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Get notified instantly when your partner opens your link, answers &quot;YES!&quot;, or selects date locations and menus.
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 5. WHATSAPP SHARE CALLOUT                                 */}
        {/* ========================================================= */}
        <div className="w-full max-w-3xl mt-12 sm:mt-16 rounded-3xl bg-slate-900 px-6 sm:px-10 py-8 sm:py-10 text-center text-white">
          <div className="text-3xl mb-3">💌</div>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">Your partner will actually open this</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-6">
            Every link you share shows a beautiful WhatsApp &amp; Instagram preview card — so they know something special is waiting for them.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-lg shadow-rose-900/30"
          >
            <Sparkles className="w-4 h-4" /> Start for Free
          </Link>
        </div>

      </main>

      {/* ========================================================= */}
      {/* 6. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-pacifico text-rose-500 text-base">OurStory</span>
          <span>&copy; {new Date().getFullYear()} OurStory Platform. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="hover:text-slate-600 transition">Dashboard</Link>
          <Link href="/login" className="hover:text-slate-600 transition">Login</Link>
          <Link href="/dashboard/builder" className="hover:text-slate-600 transition">Builder</Link>
          <Link href="/privacy" className="hover:text-slate-600 transition">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-600 transition">Terms</Link>
          <a href="mailto:support@ourstory.love" className="hover:text-slate-600 transition">Contact</a>
        </div>
      </footer>
    </div>
  );
}
