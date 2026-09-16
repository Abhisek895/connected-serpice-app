"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { ShareCard } from "./ShareCard";

interface SaveImageButtonProps {
  url: string;
  themeColors?: {
    primary: string;
    secondary: string;
  };
  recipientName?: string;
  title?: string;
}

export function SaveImageButton(props: SaveImageButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCapture = async () => {
    if (!cardRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      // html2canvas needs a tiny delay to ensure the off-screen DOM is fully painted
      await new Promise(r => setTimeout(r, 100));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        windowWidth: 1080,
        windowHeight: 1920
      });
      
      // Convert to image and download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `OurStory-${props.recipientName || "Surprise"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Track IMAGE_SAVED
      try {
        const { recordResponseAction } = await import("@/app/p/[slug]/actions");
        const match = props.url.match(/\/p\/([^\/?#]+)/);
        if (match && match[1]) {
          await recordResponseAction(match[1], "IMAGE_SAVED");
        }
      } catch (e) {
        console.error("Failed to log tracking:", e);
      }
      
    } catch (error) {
      console.error("Failed to capture image:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCapture}
        disabled={isCapturing}
        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed relative"
        aria-label="Save as Image"
        title="Save as Image"
      >
        {isCapturing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Camera size={18} />
        )}
      </button>
      
      {/* Hidden dedicated card purely for capture */}
      <ShareCard ref={cardRef} {...props} />
    </>
  );
}
