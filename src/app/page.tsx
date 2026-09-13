import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Heart,
  Sparkles,
  Image as ImageIcon,
  Music,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Bell,
  CheckCircle2,
  Smile,
  Volume2,
} from "lucide-react";
import type { Metadata } from "next";
import { demos } from "@/app/dashboard/demoConfig";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "OurStory | The Most Romantic Way to Propose & Express Your Love 💖",
  description:
    "Don't just text her 'I love you.' Create an unforgettable interactive love proposal with her favorite romantic music, cherished photos, and magical effects. 99.4% She Says YES!",
  openGraph: {
    title: "OurStory | The Most Romantic Way to Propose & Express Your Love 💖",
    description:
      "Turn your feelings into a breathtaking, interactive love proposal. Add music, photos, and magical effects in 2 minutes. Ready to share on WhatsApp!",
    siteName: "OurStory 💖",
    type: "website",
    url: "https://ourstory.love",
    images: [
      {
        url: "https://ourstory.love/og-default.png",
        width: 1200,
        height: 630,
        alt: "OurStory — Romantic Proposal & Love Confession Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OurStory | The Most Romantic Way to Propose & Express Your Love 💖",
    description:
      "Don't just text her. Create a breathtaking interactive proposal page with her favorite song and photos. Zero code!",
    images: ["https://ourstory.love/og-default.png"],
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; demo?: string }>;
}) {
  const { ref, demo } = await searchParams;

  if (demo) {
    let resolvedDemoId = demo.trim();

    // 1. Direct match with template slug (e.g. "surprise", "im-sorry")
    const matchConfig = demos.find((d) => d.id === resolvedDemoId);
    if (!matchConfig) {
      // 2. Look up DB Theme by CUID or name
      const dbTheme = await prisma.theme.findFirst({
        where: { OR: [{ id: resolvedDemoId }, { name: resolvedDemoId }] },
      });
      if (dbTheme && demos.some((d) => d.id === dbTheme.name)) {
        resolvedDemoId = dbTheme.name;
      } else {
        // Fallback default if unmapped
        resolvedDemoId = "surprise";
      }
    }

    const refQuery = ref ? `?ref=${encodeURIComponent(ref.trim())}` : "";
    redirect(`/gift/${resolvedDemoId}${refQuery}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-pink-50/40 flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden">

      {/* ========================================================= */}
      {/* 1. HEADER / NAVBAR                                        */}
      {/* ========================================================= */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl sm:text-3xl font-bold text-rose-500 font-pacifico tracking-wider group-hover:scale-105 transition-transform flex items-center gap-1.5">
            OurStory <Heart className="w-5 h-5 fill-rose-500 text-rose-500 inline-block animate-pulse" />
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
            href="/dashboard/builder"
            className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm bg-rose-500 text-white shadow-md shadow-rose-200 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-300 transition-all flex items-center gap-1.5"
          >
            <span>Propose Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                           */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-24 max-w-6xl mx-auto w-full">

        {/* Top Emotional Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/90 border border-rose-200 text-rose-600 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 fill-rose-400" />
          <span>The Most Romantic Way To Propose &amp; Confess Your Love 💖</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.18] max-w-4xl mb-5 sm:mb-6">
          Don&apos;t just text her &ldquo;I love you.&rdquo; <br className="hidden sm:inline" />
          Give her a{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600">
            proposal she will never forget.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-8 sm:mb-10 px-2">
          Pour your deepest feelings into a private, interactive love story. Add her favorite romantic song, your most treasured photos, and a heart-melting question. Zero coding — ready to share on WhatsApp in 2 minutes.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard/builder"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-bold bg-rose-500 text-white shadow-xl shadow-rose-500/25 hover:bg-rose-600 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
          >
            <Heart className="w-5 h-5 fill-white" />
            <span>Create Her Proposal (Free)</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-full font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-base text-center shadow-xs"
          >
            Explore Romantic Demos ✨
          </Link>
        </div>

        {/* Social Proof / Confidence Strip */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500 font-medium">
          <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span><strong>15,000+</strong> Proposals Sent</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span><strong>99.4%</strong> &ldquo;She Said YES!&rdquo; Rate</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
            <Zap className="w-4 h-4 text-rose-500" />
            <span>Live Reaction Tracker</span>
          </span>
        </div>

        {/* ========================================================= */}
        {/* 3. LIVE INTERACTIVE PHONE PREVIEW (Romantic Proposal)     */}
        {/* ========================================================= */}
        <div className="mt-12 sm:mt-16 w-full max-w-xs sm:max-w-sm mx-auto">
          <div className="relative">
            {/* Phone frame */}
            <div className="bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl shadow-rose-900/20 ring-1 ring-slate-800">
              <div
                className="bg-gradient-to-b from-rose-100/90 via-white to-pink-50 rounded-[2rem] overflow-hidden flex flex-col justify-between"
                style={{ minHeight: "410px" }}
              >
                {/* Notch */}
                <div>
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-20 h-4 bg-slate-900 rounded-full" />
                  </div>

                  {/* Music bar badge */}
                  <div className="mx-4 mb-2 bg-rose-50/90 border border-rose-200/60 rounded-xl px-2.5 py-1 flex items-center justify-between text-[9px] text-rose-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3 h-3 text-rose-500 animate-pulse" />
                      <span className="truncate">Tum Se Hi — Romantic Lofi</span>
                    </span>
                    <span className="text-[8px] text-rose-400">0:42 / 3:15</span>
                  </div>
                </div>

                {/* Mock Proposal Content */}
                <div className="px-5 py-2 text-center flex-1 flex flex-col justify-center">
                  <div className="text-3xl mb-1.5 animate-bounce">🌹</div>
                  <h3 className="text-base font-pacifico text-rose-500 mb-0.5">
                    For my favorite person... Priya 💕
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium mb-3">
                    A special secret just for you ✨
                  </p>

                  {/* Love confession note */}
                  <div className="bg-white/95 rounded-2xl p-3 mb-3.5 border border-rose-100 shadow-xs text-left">
                    <p className="text-[10px] text-slate-700 leading-relaxed italic">
                      &ldquo;I never believed in soulmates until you smiled at me. From our late-night talks to the way your eyes light up when you laugh — you are my home. I don&apos;t just want you for today; I want you for all my tomorrows.&rdquo;
                    </p>
                  </div>

                  {/* The Proposal Question */}
                  <p className="text-xs font-extrabold text-slate-800 mb-3 leading-snug">
                    Will you be my girlfriend and make me the happiest person alive? 🥺💍
                  </p>

                  {/* Proposal Buttons */}
                  <div className="flex gap-2">
                    <div className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-xl shadow-md shadow-rose-300/50 flex items-center justify-center gap-1">
                      <span>YES, FOREVER! 😍</span>
                    </div>
                    <div className="flex-1 py-2 bg-slate-100 text-slate-400 text-[9px] font-bold rounded-xl flex items-center justify-center">
                      <span>No 🙈 (Runs away)</span>
                    </div>
                  </div>
                </div>

                {/* Footer tag */}
                <div className="pb-3 pt-1 text-center">
                  <span className="text-[8px] text-slate-400 font-medium">
                    💖 Made with OurStory &bull; Private &amp; Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Live Reaction Badges */}
            <div className="absolute -right-5 top-12 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-500/30 rotate-3 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>She said YES! 😭❤️</span>
            </div>
            <div className="absolute -left-5 bottom-16 bg-white border border-rose-200 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-md -rotate-3 flex items-center gap-1">
              <Bell className="w-3 h-3 text-rose-500" />
              <span>Opened 2s ago on WhatsApp!</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. THE 3 PSYCHOLOGICAL INFLUENCE TRIGGERS                 */}
        {/* ========================================================= */}
        <section className="w-full max-w-5xl mt-16 sm:mt-24 text-left">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold text-rose-500 tracking-wider uppercase bg-rose-100/80 px-3 py-1 rounded-full border border-rose-200">
              Why Couples Choose OurStory
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3">
              Why You Shouldn&apos;t Just Send an Ordinary Text Message
            </h2>
            <p className="text-xs sm:text-base text-slate-600">
              When you want to confess your love or propose, a standard WhatsApp text gets lost in seconds. Here is why an interactive love page changes everything:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* TRIGGER 1: Contrast / Fear of Being Ordinary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 fill-rose-400 text-rose-500" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  Trigger #1: The Contrast
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 mb-2">
                  A Text Gets Lost. This Gets Treasured Forever.
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  A simple &ldquo;I love you&rdquo; text gets buried under daily group chats and memes. An OurStory page plays her favorite song while walking her through your sweetest photos. It leaves her speechless and makes her feel like the most cherished person on earth.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                <span>✨ 10x higher emotional impact than plain chat</span>
              </div>
            </div>

            {/* TRIGGER 2: Elimination of Fear / "She Can't Say No" Confidence */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smile className="w-6 h-6 text-pink-500" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                  Trigger #2: Zero Anxiety
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 mb-2">
                  Takes The Nervousness Out of Proposing.
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Afraid of awkward silence or rejection? Our playful, romantic templates break all tension. Featuring music, sweet promises, and our famous runaway &ldquo;No&rdquo; button that dodges her finger until she blushes, laughs, and clicks &ldquo;YES!&rdquo;.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-pink-600 font-semibold">
                <span>💖 99.4% &ldquo;YES!&rdquo; rate across 15,000+ couples</span>
              </div>
            </div>

            {/* TRIGGER 3: Real-Time Excitement & Dopamine */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  Trigger #3: Live Dopamine
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 mb-2">
                  Know The Exact Second She Opens It &amp; Says YES.
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  No more agonizing over double blue ticks in silence. Get an instant live alert the exact second she opens your link, listens to the song, reads your letter, and taps &ldquo;YES!&rdquo; as digital confetti bursts across her screen.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-purple-600 font-semibold">
                <span>⚡ Instant live notification on your dashboard</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. TEMPLATE VARIETY STRIP                                 */}
        {/* ========================================================= */}
        <div className="w-full mt-14 sm:mt-20 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 p-px">
          <div className="bg-white rounded-3xl px-6 sm:px-10 py-6 sm:py-8">
            <p className="text-xs sm:text-sm font-semibold text-rose-500 uppercase tracking-widest mb-4 text-center">
              ✨ 8 Ready-To-Use Romantic Themes — Pick, Customize &amp; Propose
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { emoji: "💍", label: "Will You Be Mine?", color: "bg-rose-50 text-rose-700 border-rose-200" },
                { emoji: "💕", label: "She Can&apos;t Say No", color: "bg-red-50 text-red-700 border-red-200" },
                { emoji: "💖", label: "3D Glowing Heart", color: "bg-pink-50 text-pink-700 border-pink-200" },
                { emoji: "🥺", label: "Cute Forgive Me", color: "bg-purple-50 text-purple-700 border-purple-200" },
                { emoji: "🎁", label: "Romantic Surprise", color: "bg-amber-50 text-amber-700 border-amber-200" },
                { emoji: "🎂", label: "Birthday Love Wish", color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
                { emoji: "🌆", label: "Kolkata Date Night", color: "bg-sky-50 text-sky-700 border-sky-200" },
                { emoji: "🌿", label: "Dreamy Sunset Date", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              ].map((t) => (
                <div key={t.label} className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold ${t.color}`}>
                  <span className="text-base sm:text-lg">{t.emoji}</span>
                  <span className="leading-tight" dangerouslySetInnerHTML={{ __html: t.label }} />
                </div>
              ))}
            </div>
            <div className="mt-5 text-center">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors">
                Browse all romantic templates <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. FEATURE CARDS GRID                                     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl w-full mt-12 sm:mt-16 text-left">

          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-100/80 text-rose-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Cherished Photo Galleries</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Add your favorite memories together with smooth slideshows, Polaroid frames, floating heart animations, and custom love letters.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-3xl shadow-sm border border-purple-100 hover:border-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100/80 text-purple-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Her Favorite Romantic Song</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Choose from timeless romantic tracks (Tum Se Hi, Raataan Lambiyan, Perfect) or upload your song to set the mood instantly.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-3xl shadow-sm border border-pink-100 hover:border-pink-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group sm:col-span-2 md:col-span-1">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-100/80 text-pink-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-pink-500 text-pink-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Interactive Reaction Triggers</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Engage her with confession reveals, runaway &ldquo;No&rdquo; buttons, celebration fireworks, and real-time alerts when she says YES!
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 7. WHATSAPP & INSTAGRAM PREVIEW CALLOUT                   */}
        {/* ========================================================= */}
        <div className="w-full max-w-3xl mt-12 sm:mt-16 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 px-6 sm:px-10 py-8 sm:py-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="text-3xl mb-3">💌</div>
            <h2 className="text-xl sm:text-3xl font-extrabold mb-3">
              She Will Actually Open This
            </h2>
            <p className="text-slate-300 text-xs sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
              Every link you send generates an enchanting WhatsApp &amp; Instagram preview card with a personalized teaser — creating instant curiosity and anticipation before she even clicks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/builder"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-rose-900/40 hover:scale-105"
              >
                <Sparkles className="w-4 h-4" /> Start Her Proposal For Free
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              Takes only 2 minutes &bull; No credit card required &bull; 100% Private
            </p>
          </div>
        </div>

      </main>

      {/* ========================================================= */}
      {/* 8. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-pacifico text-rose-500 text-base">OurStory</span>
          <span>&copy; {new Date().getFullYear()} OurStory Platform. Made with love for lovers.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="hover:text-rose-500 transition">Dashboard</Link>
          <Link href="/login" className="hover:text-rose-500 transition">Login</Link>
          <Link href="/dashboard/builder" className="hover:text-rose-500 transition">Builder</Link>
          <Link href="/privacy" className="hover:text-rose-500 transition">Privacy</Link>
          <Link href="/terms" className="hover:text-rose-500 transition">Terms</Link>
          <a href="mailto:support@ourstory.love" className="hover:text-rose-500 transition">Contact</a>
        </div>
      </footer>
    </div>
  );
}
