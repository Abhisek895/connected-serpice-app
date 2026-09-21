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
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
      <img
        src={src}
        alt="Preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 25%",
        }}
      />
    </div>
  );
}
