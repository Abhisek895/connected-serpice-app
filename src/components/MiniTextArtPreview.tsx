"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * MiniTextArtPreview
 * Mirrors the RomanticLoveTemplate text-art effect for use in card thumbnails.
 * Shows the uploaded image in grayscale + contrast with a repeating text overlay on black bg.
 */
export default function MiniTextArtPreview({
  src,
  phrase,
}: {
  src: string;
  phrase?: string;
}) {
  // Use a fixed massive string to avoid any layout thrashing or resize loops.
  // 1500 repetitions is enough to cover the thumbnail size safely.
  const effective = phrase?.trim() || "love you";
  const repeatPhrase = effective.toUpperCase() + "  ";
  const massiveText = repeatPhrase.repeat(1500);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}>
      {/* Text pixel layer */}
      <div
        style={{
          position: "absolute", top: 0, left: 0,
          width: "300%", height: "300%",
          transform: "scale(0.3333)", transformOrigin: "top left",
          zIndex: 1, backgroundColor: "black", color: "white",
          fontSize: "8px", lineHeight: "8px", letterSpacing: "0px",
          fontWeight: 900, wordBreak: "break-all", overflow: "hidden",
          textAlign: "justify",
        }}
      >
        {massiveText}
      </div>
      {/* Source image */}
      <img
        src={src}
        alt="Preview"
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
