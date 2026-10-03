import React from "react";
import Link from "next/link";
import {
  Heart,
  ChevronRight,
  Eye,
  CheckCircle2,
  Flame,
  Gift,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sharodiya Whisper — A Puja Proposal Experience | Bengal After Dusk",
  description:
    "The most personal Durga Puja invitation you've ever sent. Not a card — a letter. Not a form — a story. Create yours in 5 minutes.",
  openGraph: {
    title: "Sharodiya Whisper — A Puja Proposal Experience",
    description:
      "The most personal Durga Puja invitation you've ever sent. Not a card — a letter. Not a form — a story.",
    type: "website",
  },
};

function MarigoldDot() {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ background: "radial-gradient(circle, #F4B942, #E8791A)" }}
    />
  );
}

export default function SharodyaWhisperLandingPage() {
  return (
    <div
      className="min-h-screen text-[#2C1A0E] font-sans"
      style={{ background: "linear-gradient(155deg,#FFF1DC 0%,#FFE8C8 50%,#FFD9AD 100%)" }}
    >
      {/* Top Nav */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link href="/puja" className="flex items-center gap-2 group">
          <span
            className="text-2xl font-bold tracking-wide text-[#2C1A0E] group-hover:text-[#E8791A] transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            OurStory
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8791A]/15 text-[#E8791A] border border-[#E8791A]/30 font-medium">
            Whisper
          </span>
        </Link>
        <Link
          href="/puja/whisper/builder"
          className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#E8791A] to-[#C05B4A] text-white border border-[#F4B942]/40 hover:scale-105 transition-all shadow-md"
        >
          Create yours
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-24 space-y-20">

        <section className="text-center space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-[#E8791A]/25 text-xs text-[#E8791A] tracking-wider backdrop-blur-sm">
            <MarigoldDot />
            <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>শারদোৎসব ২০২৬</span>
            <span>•</span>
            <span>Sharodiya Whisper</span>
          </div>

          {/* Hero copy */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h1
              className="text-4xl sm:text-6xl font-bold tracking-tight text-[#2C1A0E] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Not an invitation.{" "}
              <span className="italic text-[#E8791A]">A letter.</span>
            </h1>
            <p
              className="text-sm sm:text-lg text-[#5C3D2E] max-w-lg mx-auto leading-relaxed"
              style={{ fontFamily: "Lora, Georgia, serif" }}
            >
              She&apos;s seen enough digital cards. This is something completely
              different — a handcrafted, poetic experience she&apos;ll explore slowly, and
              remember for a long time.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/puja/whisper/builder"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E8791A] to-[#C05B4A] text-sm font-semibold text-white border border-[#F4B942]/50 shadow-xl shadow-[#E8791A]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Create my letter</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/i/puja-whisper-demo"
              target="_blank"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/60 hover:bg-white/80 text-sm font-medium text-[#5C3D2E] border border-[#2C1A0E]/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Eye className="w-4 h-4 text-[#E8791A]" />
              <span>See the demo</span>
            </Link>
          </div>
        </section>

        {/* Contrast: Old vs Whisper */}
        <section className="space-y-6">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#E8791A] font-semibold">
              What makes it different
            </span>
            <h2
              className="mt-1 text-2xl sm:text-3xl font-bold text-[#2C1A0E]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Every other invitation vs. Sharodiya Whisper
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Old */}
            <div className="p-6 rounded-3xl bg-white/50 border border-[#2C1A0E]/10 space-y-3 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-[#5C3D2E] opacity-70">Other digital invitations</h3>
              {[
                "Static card with a photo",
                "Generic font, generic layout",
                "She reads it in 4 seconds",
                "Forgotten by evening",
                "No personal touch at all",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2 text-xs text-[#5C3D2E]/60">
                  <span className="mt-0.5 text-[#5C3D2E]/30">✕</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Whisper */}
            <div
              className="p-6 rounded-3xl border border-[#F4B942]/50 space-y-3 shadow-lg"
              style={{ background: "linear-gradient(135deg, #FFFBF2, #FFF3DC)" }}
            >
              <h3 className="text-sm font-bold text-[#E8791A]">✦ Sharodiya Whisper</h3>
              {[
                "A letter that reveals itself slowly",
                "Poetic, warm, deeply personal copy",
                "She explores 10 beautiful screens",
                "Picks the day, vibe, food together",
                "Receives a secret surprise from you",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2 text-xs text-[#5C3D2E]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E8791A] shrink-0 mt-0.5" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey walkthrough */}
        <section className="space-y-6">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-[#E8791A] font-semibold">
              What she experiences
            </span>
            <h2
              className="mt-1 text-2xl sm:text-3xl font-bold text-[#2C1A0E]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              A journey, not a page.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                emoji: "✉️",
                title: "A Letter Arrives",
                desc: "She sees a floating envelope. Warm cream, shiuli petals, Bengali script. She opens it.",
              },
              {
                emoji: "🌸",
                title: "Your Memory",
                desc: "The letter opens with a personal memory you share with her. She feels seen before you even ask.",
              },
              {
                emoji: "⏳",
                title: "This Autumn",
                desc: "Poetic text about scarcity — 48 hours of magic in five days. The ask feels real.",
              },
              {
                emoji: "❤️",
                title: "The Question",
                desc: "আমার সাথে পুজোয় যাবে? — big, warm, and respectful. A YES button that glows.",
              },
              {
                emoji: "🗓️",
                title: "Planning Together",
                desc: "She picks the day, the vibe, the street foods. She co-builds your Puja plan.",
              },
              {
                emoji: "🤫",
                title: "The Secret",
                desc: "A surprise reveal — a secret you kept just for her. The moment she remembers forever.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-2xl bg-white/60 border border-[#E8791A]/20 space-y-2 backdrop-blur-sm hover:bg-white/80 transition-colors"
              >
                <span className="text-2xl">{item.emoji}</span>
                <h3 className="text-sm font-bold text-[#2C1A0E]">{item.title}</h3>
                <p className="text-xs text-[#5C3D2E]/80 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Psychology teaser */}
        <section
          className="p-8 rounded-3xl border border-[#F4B942]/50 space-y-5 text-left max-w-2xl mx-auto shadow-xl"
          style={{ background: "linear-gradient(135deg,#FFF8EE,#FFEFD0)" }}
        >
          <span className="text-xs uppercase tracking-widest text-[#E8791A] font-bold">
            Why it works
          </span>
          <h3
            className="text-2xl font-bold text-[#2C1A0E]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Designed around how she actually feels.
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#5C3D2E]">
            {[
              {
                icon: <Flame className="w-4 h-4 text-[#E8791A] shrink-0 mt-0.5" />,
                text: "You share a memory first — she feels reciprocity before you ask anything.",
              },
              {
                icon: <Gift className="w-4 h-4 text-[#E8791A] shrink-0 mt-0.5" />,
                text: "She picks the day & food — now she owns the plan, and saying yes feels natural.",
              },
              {
                icon: <Heart className="w-4 h-4 fill-rose-400 text-rose-400 shrink-0 mt-0.5" />,
                text: "The secret reveal creates a peak emotional moment at the end she won&apos;t forget.",
              },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                {item.icon}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Link
              href="/puja/whisper/builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2C1A0E] hover:bg-[#3D2510] text-xs font-semibold text-white transition-all"
            >
              <span>Start writing her letter</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#F4B942]" />
            </Link>
          </div>
        </section>

        {/* Other template link */}
        <section className="text-center space-y-3">
          <p className="text-xs text-[#5C3D2E]/60">
            Looking for the original dark cinematic version?
          </p>
          <Link
            href="/puja"
            className="inline-flex items-center gap-2 text-xs text-[#5C3D2E] underline underline-offset-2 hover:text-[#E8791A] transition-colors"
          >
            See Bengal After Dusk (v1) →
          </Link>
        </section>
      </main>
    </div>
  );
}
