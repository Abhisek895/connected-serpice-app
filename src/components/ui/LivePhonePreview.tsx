"use client";

import { useState } from "react";
import { Heart, Music, Sparkles, Image as ImageIcon, MessageSquare } from "lucide-react";

interface LivePhonePreviewProps {
  demoId: string;
  formValues: Record<string, string>;
  defaultData: Record<string, any>;
  currentStep?: number;
}

export default function LivePhonePreview({ demoId, formValues, defaultData, currentStep = 0 }: LivePhonePreviewProps) {
  const [showLetterPreview, setShowLetterPreview] = useState(false);

  const displayTitle = formValues["title"] || defaultData["title"] || "A Surprise For You... 😊";
  const displayRecipient = formValues["recipientName"] || defaultData["recipientName"] || "Someone Special ✨";
  const displayQuestion = formValues["question"] || defaultData["question"] || "Will you be mine? 💖";
  const displayMessage = formValues["loveMessage"] || defaultData["loveMessage"] || "A little surprise from someone who truly cares…";
  const patternText = formValues["patternText"] || defaultData["patternText"] || "love you";
  const acceptBtn = formValues["acceptBtn"] || defaultData["acceptBtn"] || "Yes! 😍";
  const rejectBtn = formValues["rejectBtn"] || defaultData["rejectBtn"] || "No 🙈";

  const photoUrl = formValues["_photo"] || formValues["_photo1"] || defaultData["_photo"] || defaultData["photo"];

  const isBirthday = demoId === "birthday-wish";
  const isPlanner = demoId.includes("planner");
  const isSurprise = demoId === "surprise";

  const isStep2 = currentStep === 1;

  return (
    <div className="w-full max-w-[280px] mx-auto select-none">
      {/* Outer Phone Frame */}
      <div className="bg-slate-900 p-3 rounded-[38px] shadow-2xl border-4 border-slate-800 relative">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 mr-3" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/80" />
        </div>

        {/* Screen */}
        <div className={`w-full h-[480px] rounded-[30px] overflow-hidden relative flex flex-col justify-between p-4 pt-10 text-white text-center shadow-inner transition-all duration-300 ${
          isStep2 && isSurprise ? "bg-black" : "bg-gradient-to-br from-slate-950 via-rose-950 to-purple-950"
        }`}>

          {/* Ambient Glow */}
          {!isStep2 && (
            <>
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            </>
          )}


          {/* Content Body — Step 2 View for Romantic Surprise (Matches Real Generated Page) */}
          {isStep2 && isSurprise ? (
            <div className="relative z-10 h-full w-full flex flex-col justify-between items-center py-2 px-1">
              {/* Dead-Centered Portrait Container */}
              <div className="my-auto flex items-center justify-center w-full">
                <div className="relative inline-flex items-center justify-center overflow-hidden max-w-full shadow-2xl">
                  {/* 1. Ultra-dense White Monospace Text Pixel Matrix (Spans ONLY image bounds) */}
                  <div
                    className="absolute inset-0 w-[300%] h-[300%] bg-black text-white text-[8px] font-black leading-[8px] tracking-tighter overflow-hidden select-none pointer-events-none break-all text-justify p-0 origin-top-left z-0"
                    style={{
                      fontFamily: "monospace",
                      transform: "scale(0.33333)",
                    }}
                  >
                    {((patternText || "love you").trim() + "  ").repeat(3000)}
                  </div>

                  {/* 2. Source Image with Natural Aspect Ratio + Grayscale + Contrast + Multiply Blend Mode */}
                  <img
                    src={photoUrl || "/demos/surprise/cute_woman.png"}
                    alt="Portrait Preview"
                    className="relative z-10 w-full h-auto max-h-[220px] object-contain block"
                    style={{
                      filter: "grayscale(100%) contrast(160%) brightness(1.2)",
                      mixBlendMode: "multiply",
                    }}
                  />

                  {/* 3. Popup Note Overlay directly on top of photo */}
                  {showLetterPreview && (
                    <div
                      onClick={() => setShowLetterPreview(false)}
                      className="absolute inset-2 z-30 m-auto bg-white/95 backdrop-blur-md rounded-xl p-3 text-slate-900 flex flex-col items-center justify-center text-center shadow-2xl border border-white/60 cursor-pointer animate-in zoom-in-95 duration-200"
                    >
                      <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider mb-1">💌 Message for you</span>
                      <p className="text-[10px] font-medium italic leading-snug line-clamp-4">"{displayMessage}"</p>
                      <span className="text-[8px] text-slate-400 mt-2 font-bold">(Tap note to close)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Page 2 Buttons at Bottom */}
              <div className="pb-2 flex flex-col items-center gap-1.5 w-full shrink-0">
                {!showLetterPreview && (
                  <button
                    onClick={() => setShowLetterPreview(true)}
                    className="px-3.5 py-1 rounded-full bg-white/95 text-rose-600 text-[9.5px] font-bold shadow-md tracking-tight hover:bg-white cursor-pointer transition transform active:scale-95"
                  >
                    💌 Read My Message
                  </button>
                )}
                <span className="px-4 py-1 rounded-full bg-rose-500 text-white text-[9.5px] font-bold shadow-md shadow-rose-950/60">
                  ✨ Continue
                </span>
              </div>
            </div>
          ) : isStep2 && isBirthday ? (
            <div className="relative z-10 my-auto space-y-3 px-1">
              {/* Birthday Slideshow Mockup */}
              <div className="relative mx-auto w-36 h-44 rounded-2xl bg-black/60 border border-amber-400/40 p-2 flex flex-col items-center justify-center overflow-hidden shadow-xl">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center mb-2">
                  <span className="text-xl">🎂</span>
                </div>
                <span className="text-[10px] font-bold text-amber-200">Photo Slideshow</span>
                <span className="text-[8px] text-amber-400/80 mt-1 line-clamp-2 px-1">
                  "{displayMessage}"
                </span>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] bg-amber-500 text-slate-950 rounded-full font-bold shadow-sm">
                  🎉 Birthday Wishes
                </span>
              </div>
            </div>
          ) : (
            /* Step 1 / Cover View */
            <div className="relative z-10 my-auto space-y-3 px-1">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
                {isBirthday ? (
                  <span className="text-xl">🎂</span>
                ) : isPlanner ? (
                  <span className="text-xl">🌸</span>
                ) : (
                  <Heart className="w-6 h-6 fill-rose-500 animate-pulse" />
                )}
              </div>

              <h4 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 leading-tight">
                {displayTitle}
              </h4>

              <p className="text-xs font-medium text-rose-300/90 truncate">
                For: <span className="font-bold text-white">{displayRecipient}</span>
              </p>

              {isPlanner ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-xl text-[11px] text-rose-100 leading-snug">
                  {displayQuestion}
                </div>
              ) : isBirthday ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-xl text-[11px] text-pink-100 leading-snug line-clamp-3">
                  "{displayMessage}"
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-rose-200 leading-snug">
                    "{displayQuestion}"
                  </p>
                  <div className="flex gap-2 justify-center pt-1">
                    <span className="px-3 py-1 text-[10px] bg-rose-500 text-white rounded-full font-bold shadow-sm">
                      {acceptBtn}
                    </span>
                    <span className="px-3 py-1 text-[10px] bg-white/20 text-white rounded-full font-medium border border-white/20">
                      {rejectBtn}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* iPhone Home Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
