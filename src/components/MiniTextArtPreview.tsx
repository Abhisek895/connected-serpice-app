"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * MiniTextArtPreview
 * Mirrors the RomanticLoveTemplate text-art effect for use in card thumbnails.
 * Shows the uploaded image in grayscale + contrast with a repeating text overlay on black bg.
 */
export default function MiniTextArtPreview({
  src,
  phrase = "LOVE YOU",
}: {
  src: string;
  phrase?: string;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const generateArt = useCallback(() => {
    const img = imgRef.current;
    const wall = textRef.current;
    if (!img || !wall || !img.complete || img.naturalWidth === 0) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    const multiplier = 3;
    const charsPerLine = Math.ceil((w * multiplier) / 5);
    const totalLines = Math.ceil((h * multiplier) / 8);
    const totalChars = charsPerLine * totalLines * 1.5;
    const effective = (phrase && phrase.trim()) ? phrase.trim() : "love you";
    const repeatPhrase = effective.toUpperCase() + "  ";
    wall.innerText = repeatPhrase.repeat(Math.ceil(totalChars / repeatPhrase.length));
  }, [phrase]);

  useEffect(() => {
    window.addEventListener("resize", generateArt);
    return () => window.removeEventListener("resize", generateArt);
  }, [generateArt]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}>
      {/* Text pixel layer */}
      <div
        ref={textRef}
        style={{
          position: "absolute", top: 0, left: 0,
          width: "300%", height: "300%",
          transform: "scale(0.3333)", transformOrigin: "top left",
          zIndex: 1, backgroundColor: "black", color: "white",
          fontSize: "8px", lineHeight: "8px", letterSpacing: "0px",
          fontWeight: 900, wordBreak: "break-all", overflow: "hidden",
          textAlign: "justify",
        }}
      />
      {/* Source image */}
      <img
        ref={imgRef}
        src={src}
        alt="Portrait preview"
        onLoad={generateArt}
        style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: "grayscale(100%) contrast(160%) brightness(1.2)",
          mixBlendMode: "multiply",
          zIndex: 2,
        }}
      />
    </div>
  );
}
