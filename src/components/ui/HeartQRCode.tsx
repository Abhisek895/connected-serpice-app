"use client";

import React, { useMemo } from "react";
import QRCode from "qrcode";

interface HeartQRCodeProps {
  url: string;
  size?: number;
  color?: string;
  bgColor?: string;
}

export default function HeartQRCode({
  url,
  size = 200,
  color = "#f43f5e", // default rose-500
  bgColor = "transparent",
}: HeartQRCodeProps) {
  const qr = useMemo(() => {
    try {
      return QRCode.create(url, { errorCorrectionLevel: "M" });
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [url]);

  if (!qr) return null;

  const moduleSize = qr.modules.size;
  const cellSize = size / moduleSize;

  const paths: React.ReactNode[] = [];
  const pdpPaths: React.ReactNode[] = [];

  for (let row = 0; row < moduleSize; row++) {
    for (let col = 0; col < moduleSize; col++) {
      const isDark = qr.modules.data[row * moduleSize + col];
      if (isDark) {
        const isPDP =
          (row < 7 && col < 7) ||
          (row < 7 && col >= moduleSize - 7) ||
          (row >= moduleSize - 7 && col < 7);

        const x = col * cellSize;
        const y = row * cellSize;

        if (isPDP) {
          // Render PDP as a standard rectangle for scanability
          pdpPaths.push(
            <rect
              key={`pdp-${row}-${col}`}
              x={x}
              y={y}
              width={cellSize + 0.5} // slightly larger to prevent gaps
              height={cellSize + 0.5}
              fill={color}
            />
          );
        } else {
          // Render data module as a heart
          // We will use an SVG path for a heart, scaled to the cell size.
          // A standard heart path in a 24x24 viewport:
          // M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z
          
          // Let's create a heart that fills a 1x1 cell perfectly.
          // Or just use a scale transform.
          const scale = (cellSize / 24) * 0.95;
          const centerOffsetX = x + (cellSize - 24 * scale) / 2;
          const centerOffsetY = y + (cellSize - 24 * scale) / 2;

          paths.push(
            <g
              key={`heart-${row}-${col}`}
              transform={`translate(${centerOffsetX}, ${centerOffsetY}) scale(${scale})`}
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={color}
              />
            </g>
          );
        }
      }
    }
  }

  return (
    <svg
      id="heart-qr-code"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ backgroundColor: bgColor }}
    >
      {pdpPaths}
      {paths}
    </svg>
  );
}
