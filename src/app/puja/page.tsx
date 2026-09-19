import React from "react";
import Link from "next/link";
import {
  Heart,
  ChevronRight,
  Flame,
  Volume2,
  Share2,
  Calendar,
  Compass,
  Smile,
  Eye,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Durga Puja Invitation Experience | Bengal After Dusk",
  description:
    "Turn a simple invitation into a memory. Create a cinematic digital Durga Puja invitation for someone special.",
  openGraph: {
    title: "Durga Puja Invitation Experience | Bengal After Dusk",
    description: "Create a cinematic digital Durga Puja invitation for someone special.",
    type: "website",
  },
};

export default function DurgaPujaLandingPage() {
  return (
    <div className="min-h-screen bg-[#161413] text-[#FDFBF7] font-sans selection:bg-[#631726] selection:text-[#FDFBF7]">
      {/* Top Bar */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link href="/puja" className="flex items-center gap-2 group">
          <span className="font-editorial text-2xl font-bold tracking-wide text-[#FDFBF7] group-hover:text-[#D4AF37] transition-colors">
            OurStory
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#631726]/60 text-[#D4AF37] border border-[#D4AF37]/30 font-medium">
            Bengal After Dusk
          </span>
        </Link>
        <Link
          href="/puja/builder"
          className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#631726] to-[#8C2337] border border-[#D4AF37]/40 text-[#FDFBF7] hover:scale-105 transition-all shadow-md"
        >
          Create Invitation
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24 text-center space-y-8">
        {/* Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C0422B]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Bengali Monogram / Motif */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#24201D] border border-[#D4AF37]/30 text-xs text-[#D4AF37] tracking-wider">
          <span className="font-bengali">শারদোৎসব ২০২৬</span>
          <span>•</span>
          <span>Digital Puja Experience</span>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <h1 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight text-[#FDFBF7] leading-tight">
            Make an invitation <br className="hidden sm:inline" />
            <span className="italic text-[#D4AF37]">worth remembering.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#FDFBF7]/75 font-editorial sm:text-xl max-w-lg mx-auto leading-relaxed">
            Create a beautiful, personal experience for someone special. Autumn evening walks, dhak rhythms, pandal lights, and endless adda.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/puja/builder"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#631726] via-[#7D1D31] to-[#C0422B] text-sm font-semibold text-[#FDFBF7] border border-[#D4AF37]/50 shadow-xl shadow-[#631726]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Create my invitation</span>
            <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
          </Link>
          <Link
            href="/i/demo"
            target="_blank"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#211E1C] hover:bg-[#2A2623] text-sm font-medium text-[#FDFBF7]/80 hover:text-[#FDFBF7] border border-[#FDFBF7]/15 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-[#D4AF37]" />
            <span>Experience the demo</span>
          </Link>
        </div>

        {/* Emotional Journey Preview Grid */}
        <div className="pt-16 text-left max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              The Recipient Experience
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FDFBF7]">
              Not an invitation card. A cinematic digital memory.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#211E1C] border border-[#D4AF37]/20 space-y-2">
              <span className="text-2xl">🌸</span>
              <h3 className="text-sm font-bold text-[#FDFBF7]">Shubho Sharodiya</h3>
              <p className="text-xs text-[#FDFBF7]/70 leading-relaxed">
                Falling shiuli flowers, soft festival lighting, and Bengali typography set a mysterious, elegant mood.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#211E1C] border border-[#D4AF37]/20 space-y-2">
              <span className="text-2xl">❤️</span>
              <h3 className="text-sm font-bold text-[#FDFBF7]">The Question</h3>
              <p className="text-xs text-[#FDFBF7]/70 leading-relaxed">
                &ldquo;আমার সাথে পুজোয় যাবে?&rdquo; with respectful choices. No running buttons, purely their choice.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#211E1C] border border-[#D4AF37]/20 space-y-2">
              <span className="text-2xl">🍜</span>
              <h3 className="text-sm font-bold text-[#FDFBF7]">Interactive Choices</h3>
              <p className="text-xs text-[#FDFBF7]/70 leading-relaxed">
                They pick the Puja vibe, street foods (Phuchka, Biryani, Momos), and adventure style.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="pt-12 p-8 rounded-3xl bg-[#FAF7F0] text-[#161413] border border-[#D4AF37]/40 text-left max-w-2xl mx-auto shadow-2xl space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#C0422B] font-bold">
            Universal & Zero App Install
          </span>
          <h3 className="font-editorial text-2xl font-bold text-[#161413]">
            How it works
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-[#161413]/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C0422B] shrink-0 mt-0.5" />
              <span>Personalize names, vibe, heartfelt note, and food preferences in 2 minutes.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C0422B] shrink-0 mt-0.5" />
              <span>Receive a unique link (e.g. <code className="bg-[#EBE3D5] px-1 py-0.5 rounded text-[#631726] font-mono">/i/7K92X</code>) to share on WhatsApp or Messenger.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C0422B] shrink-0 mt-0.5" />
              <span>Recipient opens without login or install, experiences the story, and submits their response.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C0422B] shrink-0 mt-0.5" />
              <span>View their response and selected preferences on your personal status page.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/puja/builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#161413] hover:bg-[#2A2623] text-xs font-semibold text-[#FDFBF7] transition-all"
            >
              <span>Start building invitation</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
