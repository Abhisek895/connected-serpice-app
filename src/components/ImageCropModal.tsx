"use client";

import { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ZoomIn, ZoomOut, RotateCw, Crop, Heart, RefreshCw } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string;
  originalFileName?: string;
  initialAspect?: number;
  onCancel: () => void;
  onComplete: (croppedBlob: Blob, croppedFile: File) => void;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for external URLs, blob: and data: URLs fail in Safari if crossOrigin is set
    if (!imageSrc.startsWith("blob:") && !imageSrc.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => {
      console.error("Image load error:", err);
      reject(new Error("Failed to load image for cropping"));
    });
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Fix for iOS Safari and mobile browsers crashing on huge canvas memory limits.
  // We limit the maximum internal canvas size to 3000px.
  const MAX_CANVAS_SIZE = 3000;
  const scale = safeArea > MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE / safeArea : 1;

  const scaledSafeArea = safeArea * scale;
  canvas.width = scaledSafeArea;
  canvas.height = scaledSafeArea;

  // Translate & rotate canvas for safe rotated area
  ctx.translate(scaledSafeArea / 2, scaledSafeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-scaledSafeArea / 2, -scaledSafeArea / 2);
  
  // Draw scaled image
  ctx.drawImage(
    image, 
    (safeArea / 2 - image.width / 2) * scale, 
    (safeArea / 2 - image.height / 2) * scale,
    image.width * scale,
    image.height * scale
  );

  const data = ctx.getImageData(0, 0, scaledSafeArea, scaledSafeArea);

  // Set final canvas to desired crop size
  canvas.width = pixelCrop.width * scale;
  canvas.height = pixelCrop.height * scale;

  ctx.putImageData(
    data,
    Math.round(0 - scaledSafeArea / 2 + (image.width * 0.5) * scale - pixelCrop.x * scale),
    Math.round(0 - scaledSafeArea / 2 + (image.height * 0.5) * scale - pixelCrop.y * scale)
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed - possibly due to memory limits"));
      },
      "image/jpeg",
      0.90 // Slightly reduced quality to save memory and upload speed
    );
  });
}

export default function ImageCropModal({
  imageSrc,
  originalFileName = "photo.jpg",
  initialAspect = 1, // Default 1:1 Square for Polaroid & memories
  onCancel,
  onComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspect, setAspect] = useState<number>(initialAspect);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const cleanName = originalFileName.replace(/\.[^/.]+$/, "") + ".jpg";
      const file = new File([blob], cleanName, { type: "image/jpeg" });
      onComplete(blob, file);
    } catch (err) {
      console.error("Image crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const aspectOptions = [
    { label: "1:1 Square", value: 1, desc: "Polaroids & Cards" },
    { label: "4:5 Portrait", value: 4 / 5, desc: "Photos" },
    { label: "16:9 Banner", value: 16 / 9, desc: "Landscape" },
    { label: "Free", value: 0, desc: "Custom" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
          onClick={onCancel}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white text-sm font-bold flex items-center gap-1.5">
                  Crop & Adjust Photo
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                </h3>
                <p className="text-[11px] text-slate-400">Position and resize your picture perfectly</p>
              </div>
            </div>

            <button
              onClick={onCancel}
              type="button"
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Crop Viewport */}
          <div className="relative w-full bg-black/95 flex-1 min-h-[280px] sm:min-h-[340px]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect === 0 ? undefined : aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { background: "#090d16" },
                cropAreaStyle: {
                  border: "2px solid #f43f5e",
                  borderRadius: aspect === 1 ? "16px" : "12px",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
                },
              }}
            />
          </div>

          {/* Toolbar & Controls */}
          <div className="px-5 py-4 space-y-3.5 border-t border-slate-800 bg-slate-900/90">
            {/* Aspect Ratio Selector */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aspect:</span>
              <div className="flex gap-1.5 flex-1 justify-end">
                {aspectOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setAspect(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      aspect === opt.value
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom & Rotation Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Zoom slider */}
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-2 rounded-xl">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg accent-rose-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-400 w-8 text-right">{zoom.toFixed(1)}x</span>
              </div>

              {/* Rotate & Reset */}
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-2 rounded-xl justify-between">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-rose-400 transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setCrop({ x: 0, y: 0 });
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                  title="Reset position"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/60">
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Pinch or drag inside the box to adjust
            </p>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-500/25 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{isProcessing ? "Cropping..." : "Save & Crop"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
