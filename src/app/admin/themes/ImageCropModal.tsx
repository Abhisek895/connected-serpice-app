"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { X, Check, ZoomIn, ZoomOut, RotateCw, Crop } from "lucide-react";

type Point = { x: number; y: number };
type Area = { x: number; y: number; width: number; height: number };

type Props = {
  imageSrc: string;          // object URL of the selected file
  onCancel: () => void;
  onComplete: (croppedBlob: Blob, croppedUrl: string) => void;
};

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  // Translate & rotate
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2);

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg", 0.92);
  });
}

export default function ImageCropModal({ imageSrc, onCancel, onComplete }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Aspect ratio options
  const [aspect, setAspect] = useState(16 / 9);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const url = URL.createObjectURL(blob);
      onComplete(blob, url);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  const aspectOptions = [
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "1:1", value: 1 },
    { label: "Free", value: 0 },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#111827] rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Crop className="w-4 h-4 text-indigo-400" /> Crop Thumbnail
          </h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative w-full bg-black" style={{ height: 360 }}>
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
              containerStyle: { background: "#000" },
              cropAreaStyle: { border: "2px solid #6366f1", boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" }
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-4 border-t border-slate-800">
          {/* Aspect ratio */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium w-16 flex-shrink-0">Ratio</span>
            <div className="flex gap-2">
              {aspectOptions.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setAspect(opt.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    aspect === opt.value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium w-16 flex-shrink-0">Zoom</span>
            <button onClick={() => setZoom(z => Math.max(1, z - 0.1))} className="p-1 text-slate-400 hover:text-white transition">
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
            />
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 text-slate-400 hover:text-white transition">
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 w-10 text-right">{zoom.toFixed(1)}×</span>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium w-16 flex-shrink-0">Rotate</span>
            <button onClick={() => setRotation(r => Math.max(-180, r - 15))} className="p-1 text-slate-400 hover:text-white transition">
              <RotateCw className="w-4 h-4 scale-x-[-1]" />
            </button>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={e => setRotation(Number(e.target.value))}
              className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
            />
            <button onClick={() => setRotation(r => Math.min(180, r + 15))} className="p-1 text-slate-400 hover:text-white transition">
              <RotateCw className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 w-10 text-right">{rotation}°</span>
          </div>

          {/* Reset */}
          <div className="flex justify-end">
            <button
              onClick={() => { setZoom(1); setRotation(0); setCrop({ x: 0, y: 0 }); }}
              className="text-xs text-slate-500 hover:text-slate-300 transition underline underline-offset-2"
            >
              Reset all
            </button>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-800 bg-slate-900/30">
          <button onClick={onCancel} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isProcessing ? "Processing…" : "Crop & Use"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
