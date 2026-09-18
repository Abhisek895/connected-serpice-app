"use client";

import { useState, useEffect } from "react";
import { Heart, Music, Image as ImageIcon, MessageSquare } from "lucide-react";
import { RecipientActionBar } from "./RecipientActionBar";

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

  const userBirthdayPhotos = [
    formValues["_photo"],
    formValues["photoUrl"],
    formValues["_photo1"],
    formValues["_photo2"],
    formValues["_photo3"],
  ].filter(Boolean) as string[];

  const [bdaySlideIndex, setBdaySlideIndex] = useState(0);
  useEffect(() => {
    if (userBirthdayPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setBdaySlideIndex((idx) => (idx + 1) % userBirthdayPhotos.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [userBirthdayPhotos.length]);

  const activeBdayPhoto = userBirthdayPhotos.length > 0
    ? userBirthdayPhotos[bdaySlideIndex % userBirthdayPhotos.length]
    : defaultData["_photo"] || defaultData["photo"] || "/demos/birthday-wish/s0.jpeg";

  const photoUrl = userBirthdayPhotos[0] || formValues["_photo"] || formValues["_photo1"] || defaultData["_photo"] || defaultData["photo"];

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
            <div className="absolute inset-0 z-30 flex flex-col justify-center items-center bg-black rounded-[30px] overflow-hidden">
              {/* Dead-Centered Portrait Container */}
              <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                <div className="relative flex items-center justify-center overflow-hidden w-full">
                  {/* 1. Ultra-dense White Monospace Text Pixel Matrix (Spans ONLY image bounds) */}
                  <div
                    className="absolute inset-0 w-[300%] h-[300%] bg-black text-white text-[8px] font-black leading-[8px] tracking-tighter overflow-hidden select-none pointer-events-none break-all text-justify p-0 origin-top-left z-0"
                    style={{
                      fontFamily: "monospace",
                      transform: "scale(0.33333)",
                      willChange: "transform",
                    }}
                  >
                    {((patternText || "love you").trim() + "  ").repeat(3000)}
                  </div>

                  {/* 2. Source Image with Natural Aspect Ratio + Grayscale + Contrast + Multiply Blend Mode */}
                  <img
                    src={photoUrl || "/demos/surprise/cute_woman.png"}
                    alt="Portrait Preview"
                    className="relative z-10 w-full h-auto object-cover block"
                    style={{
                      filter: "grayscale(100%) contrast(160%) brightness(1.2)",
                      mixBlendMode: "multiply",
                    }}
                  />
                </div>
              </div>

              {/* Popup Note Overlay */}
              {showLetterPreview && (
                <div
                  onClick={() => setShowLetterPreview(false)}
                  className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur-md rounded-xl p-3 text-slate-900 flex flex-col items-center justify-center text-center shadow-2xl border border-white/60 cursor-pointer animate-in zoom-in-95 duration-200"
                >
                  <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider mb-1">💌 Message for you</span>
                  <p className="text-[10px] font-medium italic leading-snug line-clamp-4">"{displayMessage}"</p>
                  <span className="text-[8px] text-slate-400 mt-2 font-bold">(Tap note to close)</span>
                </div>
              )}

              {/* Page 2 Buttons at Bottom */}
              <div className="absolute bottom-10 left-0 right-0 flex flex-row items-center justify-center gap-1.5 w-full max-w-[210px] mx-auto z-40">
                {!showLetterPreview && (
                  <button
                    onClick={() => setShowLetterPreview(true)}
                    className="flex-1 py-1 rounded-full bg-white/95 text-rose-600 text-[8px] font-bold shadow-md tracking-tight hover:bg-white cursor-pointer transition transform active:scale-95 text-center whitespace-nowrap"
                  >
                    💌 Message
                  </button>
                )}
                <span className="flex-1 py-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[8px] font-bold shadow-md shadow-rose-950/60 text-center whitespace-nowrap">
                  ✨ Continue
                </span>
              </div>
            </div>
          ) : isBirthday ? (
            <div className="relative z-10 h-full w-full flex flex-col justify-center items-center py-2 px-1">
              {/* Glass Card Container (Matches Real Birthday Card & Photos) */}
              <div className="w-full bg-rose-950/40 backdrop-blur-xl border border-rose-300/30 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col items-center text-center space-y-2">
                {/* 1. Photo Container */}
                <div className="relative w-full h-[130px] sm:h-[140px] rounded-xl overflow-hidden shadow-md bg-slate-950">
                  <img
                    src={activeBdayPhoto}
                    alt="Birthday Photo"
                    className="w-full h-full object-cover object-[center_35%] transition-opacity duration-500"
                  />
                </div>

                {/* 2. Heading BELOW photo box */}
                <h4 className="text-xs font-bold text-white font-serif tracking-tight leading-snug px-1 text-left w-full">
                  Happy Birthday, <span className="text-rose-300 font-extrabold">{displayRecipient} ✨</span> 🦋 💖
                </h4>

                {/* 3. Subtitle BELOW heading */}
                <p className="text-[9px] text-rose-100/90 font-medium text-left w-full">
                  A little surprise from someone who truly cares…
                </p>

                {/* 4. Live Message Box */}
                <div className="w-full bg-white/5 rounded-lg p-1.5 text-left border border-white/10">
                  <p className="text-[9.5px] text-white font-medium leading-relaxed">
                    {displayMessage}
                    <span className="animate-pulse text-white/80"> |</span>
                  </p>
                </div>
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
                      Close Letter & Continue 💌
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
                    Tap Here 💖
                  </span>
                </div>
              </div>
            )
          ) : isStep2 ? (
            /* Step 2 View for Dodge / Planner / Media templates */
            <div className="relative z-10 my-auto space-y-3 px-1 w-full text-center">
              {isPlanner ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white space-y-2">
                  <span className="text-xs font-bold text-rose-300 block">🌸 Menu & Date Plan Summary</span>
                  <div className="bg-black/40 rounded-xl p-2 text-left space-y-1 text-[9.5px]">
                    <p className="text-rose-200 font-bold">🍔 Food Menu:</p>
                    <p className="text-slate-300 truncate">{formValues["foodOptions"] || defaultData["foodOptions"] || "Biryani, Momo, Fuchka"}</p>
                    <p className="text-rose-200 font-bold pt-1">📍 Activities:</p>
                    <p className="text-slate-300 truncate">{formValues["activityOptions"] || defaultData["activityOptions"] || "Victoria Walk, Boat Ride"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white space-y-2">
                  <span className="text-xs font-bold text-rose-300 block">😜 Dodging 'No' Messages Preview</span>
                  <div className="bg-black/50 rounded-xl p-2 text-left text-[9.5px] text-rose-100 space-y-1 max-h-[120px] overflow-y-auto font-mono">
                    {(formValues["dodgeMessages"] || defaultData["dodgeMessages"] || "Think again! 🥺")
                      .split("\n")
                      .map((msg: string, idx: number) => (
                        <p key={idx} className="truncate">▪ {msg}</p>
                      ))}
                  </div>
                </div>
              )}

              {photoUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto border border-white/30 shadow-md">
                  <img src={photoUrl} alt="Uploaded Media" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
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
          
          <div className="absolute bottom-6 w-full left-0 z-50 flex justify-center scale-90">
            <RecipientActionBar 
              url={typeof window !== "undefined" ? window.location.origin + "/p/preview" : ""}
              recipientName={displayRecipient}
              title={displayTitle}
              position="absolute"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
