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

  const isBirthday = demoId === "birthday-wish";
  const isPlanner = demoId.includes("planner");
  const isSurprise = demoId === "surprise";
  const isApology = demoId === "im-sorry" || demoId === "apology";

  const displayTitle = formValues["title"] || defaultData["title"] || "A Surprise For You... 😊";
  const displayRecipient = formValues["recipientName"] || defaultData["recipientName"] || "Someone Special ✨";
  const displayQuestion = formValues["question"] || defaultData["question"] || "Will you be mine? 💖";
  const displayMessage = formValues["loveMessage"] || defaultData["loveMessage"] || "A little surprise from someone who truly cares…";
  const patternText = formValues["patternText"] || defaultData["patternText"] || "love you";
  const acceptBtn = formValues["acceptBtn"] || defaultData["acceptBtn"] || (isBirthday ? "Love ❤️" : "Yes! 😍");
  const rejectBtn = formValues["rejectBtn"] || defaultData["rejectBtn"] || (isBirthday ? "Hate 💔" : "No 🙈");

  const photoUrl = formValues["_photo"] || formValues["_photo1"] || defaultData["_photo"] || defaultData["photo"];

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
          isStep2 && isSurprise ? "bg-black" : "bg-gradient-to-br from-purple-950 via-rose-900 to-slate-950"
        }`}>

          {/* Ambient Glow */}
          {(!isStep2 || isBirthday) && (
            <>
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-pink-500/35 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-1/2 -right-12 w-36 h-36 bg-amber-400/25 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/35 rounded-full blur-2xl pointer-events-none" />
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
              <div className="pb-1.5 flex flex-col items-center justify-center gap-1 w-full max-w-[150px] mx-auto shrink-0">
                {!showLetterPreview && (
                  <button
                    onClick={() => setShowLetterPreview(true)}
                    className="w-full py-0.5 rounded-full bg-white/95 text-rose-600 text-[8.5px] font-bold shadow-md tracking-tight hover:bg-white cursor-pointer transition transform active:scale-95 text-center whitespace-nowrap"
                  >
                    💌 Read My Message
                  </button>
                )}
                <span className="w-full py-0.5 rounded-full bg-rose-500 text-white text-[8.5px] font-bold shadow-md shadow-rose-950/60 text-center whitespace-nowrap">
                  ✨ Continue
                </span>
              </div>
            </div>
          ) : isStep2 && isBirthday ? (
            <div className="relative z-10 h-full w-full flex flex-col justify-center items-center py-2 px-1">
              {/* Glass Card Container (Matches Real Birthday Card) */}
              <div className="w-full bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col items-center text-center space-y-2">
                {/* 1. Photo Container — CLEAN with NO text overlay */}
                <div className="relative w-full h-[130px] sm:h-[140px] rounded-xl overflow-hidden shadow-md bg-slate-950">
                  <img
                    src={photoUrl || "/demos/birthday-wish/s0.jpeg"}
                    alt="Birthday Photo"
                    className="w-full h-full object-cover object-[center_35%]"
                  />
                </div>

                {/* 2. Heading BELOW photo box */}
                <h4 className="text-xs font-bold text-white font-serif tracking-tight leading-snug px-1">
                  Happy Birthday, <span className="text-pink-400 font-extrabold">{displayRecipient} 🦋 💖</span>
                </h4>

                {/* 3. Subtitle BELOW heading */}
                <p className="text-[9px] text-rose-200/80 font-medium italic">
                  A little surprise from someone who truly cares…
                </p>

                {/* 4. Read My Message Button or Letter Reveal */}
                {showLetterPreview ? (
                  <div
                    onClick={() => setShowLetterPreview(false)}
                    className="w-full bg-white/95 backdrop-blur-md text-slate-900 rounded-xl p-2 text-center shadow-xl border border-white/60 cursor-pointer animate-in zoom-in-95 duration-200"
                  >
                    <span className="text-[8.5px] font-extrabold text-rose-500 uppercase tracking-wider block mb-0.5">💌 Message for you</span>
                    <p className="text-[9.5px] font-medium italic leading-snug line-clamp-4">"{displayMessage}"</p>
                    <span className="text-[7.5px] text-slate-400 mt-1 font-bold block">(Tap to close)</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLetterPreview(true)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-400 via-rose-500 to-pink-500 text-white font-bold text-[9.5px] shadow-lg shadow-pink-500/30 hover:scale-105 transition active:scale-95 cursor-pointer mt-0.5"
                  >
                    Read My Message 💌
                  </button>
                )}
              </div>
            </div>
          ) : isBirthday ? (
            /* Birthday Step 1 / Entry Screen (Matches Real BirthdayTemplate Stage 0) */
            <div className="relative z-10 my-auto space-y-4 px-2 text-center">
              <h4 className="text-xl font-bold text-white font-serif tracking-tight drop-shadow-md">
                {displayTitle} ❤️
              </h4>

              <p className="text-xs text-rose-100/90 font-medium leading-relaxed px-1">
                {displayQuestion}
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <span className="px-4 py-2 text-xs rounded-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-rose-500/40 tracking-wide">
                  {acceptBtn}
                </span>
                <span className="px-4 py-2 text-xs rounded-xl font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                  {rejectBtn}
                </span>
              </div>
            </div>
          ) : isApology ? (
            isStep2 ? (
              /* Apology Template Step 2 Preview: Exact 'A Letter From My Heart' Modal Card (Matching User Screenshot) */
              <div className="relative z-10 my-auto w-full px-1">
                <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 border border-rose-500/50 rounded-2xl p-3 text-white shadow-2xl space-y-2 text-left">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-rose-500/20 pb-1.5">
                    <h5 className="font-bold text-[11px] text-rose-200 flex items-center gap-1">
                      <span>A Letter From My Heart 💌</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">✕</span>
                  </div>

                  {/* Letter Content Box */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-rose-500/25 max-h-[160px] overflow-y-auto">
                    <p className="text-[9px] leading-relaxed text-slate-200 font-medium whitespace-pre-wrap">
                      {displayMessage}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-1 text-[8.5px]">
                    <span className="text-rose-300 font-bold">Forever Yours 💖</span>
                    <span className="px-2.5 py-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg shadow-md">
                      Close Letter & Continue ✨
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Apology Template Step 1 Preview: Front Parcel Unboxing Page */
              <div className="relative z-10 my-auto space-y-3 px-1 text-center">
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-tr from-rose-950 via-pink-900 to-purple-950 rounded-2xl border border-rose-300/40 shadow-xl flex flex-col items-center justify-center p-2">
                  <span className="text-2xl animate-bounce">🎁</span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight drop-shadow">
                  {displayTitle}
                </h4>

                <div className="flex justify-center pt-1">
                  <span className="px-4 py-1.5 text-[9.5px] rounded-full font-bold bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md tracking-wider uppercase">
                    Tap Here ✨
                  </span>
                </div>
              </div>
            )
          ) : (
            /* Step 1 / Cover View for other templates */
            <div className="relative z-10 my-auto space-y-3 px-1">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
                {isPlanner ? (
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
