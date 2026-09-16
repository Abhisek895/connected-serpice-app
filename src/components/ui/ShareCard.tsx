"use client";

import { forwardRef } from "react";

interface ShareCardProps {
  url: string;
  themeColors?: {
    primary: string;
    secondary: string;
  };
  recipientName?: string;
  title?: string;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ url, themeColors = { primary: "#e11d48", secondary: "#f43f5e" }, recipientName, title }, ref) => {
    
    // We render this off-screen but in the DOM so html2canvas can read it.
    // Fixed size 1080x1920 (9:16 aspect ratio, good for IG stories/WhatsApp status)
    
    return (
      <div 
        className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none"
        style={{ width: "1080px", height: "1920px", display: "flex" }} // Make it display flex to ensure layout
      >
        <div 
          ref={ref}
          className="w-full h-full relative flex flex-col justify-between overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            color: "white"
          }}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-black blur-[120px]" />
          </div>

          {/* Top Content */}
          <div className="relative z-10 p-24 pt-32 text-center">
            <h1 className="text-8xl font-bold mb-8 tracking-tight" style={{ fontFamily: "serif" }}>
              {title || "A surprise for you..."}
            </h1>
            {recipientName && (
              <h2 className="text-6xl font-medium opacity-90">
                For {recipientName} 💖
              </h2>
            )}
          </div>

          {/* Center Graphic - could be a heart, or a specialized icon based on theme */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-24">
             <div className="w-80 h-80 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-2xl flex items-center justify-center mb-16 transform -rotate-6">
                <span className="text-[12rem]">✨</span>
             </div>
             <p className="text-4xl text-center font-medium leading-relaxed opacity-90 max-w-2xl">
               I made something special for you. Open the link to experience it.
             </p>
          </div>

          {/* Bottom Branding & URL */}
          <div className="relative z-10 p-24 pb-32 flex flex-col items-center justify-center bg-black/20 backdrop-blur-md">
            <div className="bg-white/90 text-slate-900 px-10 py-5 rounded-full font-bold text-3xl mb-8 flex items-center gap-4">
              <span className="text-rose-500">🔗</span> {url.replace(/^https?:\/\//, '')}
            </div>
            <p className="text-2xl font-semibold opacity-70 tracking-widest uppercase">
              Created with OurStory 💖
            </p>
          </div>
        </div>
      </div>
    );
  }
);
ShareCard.displayName = "ShareCard";
