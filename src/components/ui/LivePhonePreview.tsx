"use client";

import { Heart, Music, Sparkles } from "lucide-react";

interface LivePhonePreviewProps {
  demoId: string;
  formValues: Record<string, string>;
  defaultData: Record<string, any>;
}

export default function LivePhonePreview({ demoId, formValues, defaultData }: LivePhonePreviewProps) {
  const displayTitle = formValues["title"] || defaultData["title"] || "A Surprise For You... 😊";
  const displayRecipient = formValues["recipientName"] || defaultData["recipientName"] || "Someone Special ✨";
  const displayQuestion = formValues["question"] || defaultData["question"] || "Will you be mine? 💖";
  const displayMessage = formValues["loveMessage"] || defaultData["loveMessage"] || "A little surprise from someone who truly cares…";
  const acceptBtn = formValues["acceptBtn"] || defaultData["acceptBtn"] || "Yes! 😍";
  const rejectBtn = formValues["rejectBtn"] || defaultData["rejectBtn"] || "No 🙈";

  const isBirthday = demoId === "birthday-wish";
  const isPlanner = demoId.includes("planner");

  return (
    <div className="w-full max-w-[280px] mx-auto select-none pointer-events-none">
      {/* Outer Phone Frame */}
      <div className="bg-slate-900 p-3 rounded-[38px] shadow-2xl border-4 border-slate-800 relative">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 mr-3" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/80" />
        </div>

        {/* Screen */}
        <div className="w-full h-[480px] bg-gradient-to-br from-slate-950 via-rose-950 to-purple-950 rounded-[30px] overflow-hidden relative flex flex-col justify-between p-4 pt-10 text-white text-center shadow-inner">
          
          {/* Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header Badge */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 fill-rose-400" /> Live Preview
            </span>
          </div>

          {/* Content Body */}
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

          {/* Footer Bar */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Music className="w-2.5 h-2.5 text-rose-400" /> Audio Active
            </span>
            <span className="text-rose-400/80 font-bold">OurStory</span>
          </div>

          {/* iPhone Home Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
