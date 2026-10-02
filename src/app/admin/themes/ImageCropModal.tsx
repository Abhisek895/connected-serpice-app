"use client";

import { useState, useRef, useEffect } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ZoomIn, ZoomOut, RotateCw, Crop } from "lucide-react";

type Props = {
  imageSrc: string;          
  onCancel: () => void;
  onComplete: (croppedBlob: Blob, croppedUrl: string) => void;
};

export default function ImageCropModal({ imageSrc, onCancel, onComplete }: Props) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspect, setAspect] = useState(16 / 9);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationLevel, setRotationLevel] = useState(0);

  const handleConfirm = () => {
    setIsProcessing(true);
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      setIsProcessing(false);
      return;
    }
    cropper.getCroppedCanvas({
      imageSmoothingQuality: 'high',
    }).toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onComplete(blob, url);
      }
      setIsProcessing(false);
    }, 'image/jpeg', 0.90);
  };

  const aspectOptions = [
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "1:1", value: 1 },
    { label: "Freeform", value: 0 },
  ];

  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    
    if (aspect === 0) {
      cropper.setAspectRatio(NaN);
    } else {
      cropper.setAspectRatio(aspect);
    }
  }, [aspect]);

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(e.target.value);
    setZoomLevel(newZoom);
    cropperRef.current?.cropper?.zoomTo(newZoom);
  };

  const resetAll = () => {
    cropperRef.current?.cropper?.reset();
    setZoomLevel(1);
    setRotationLevel(0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Crop className="w-4 h-4 text-indigo-400" /> Crop Thumbnail
            </h3>
            <button onClick={onCancel} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full bg-black" style={{ height: 360 }}>
            <Cropper
              src={imageSrc}
              style={{ height: '100%', width: '100%' }}
              initialAspectRatio={aspect === 0 ? NaN : aspect}
              guides={true}
              ref={cropperRef}
              viewMode={1}
              dragMode="crop"
              background={false}
              autoCropArea={0.9}
              checkOrientation={false}
              cropBoxResizable={true}
              cropBoxMovable={true}
              toggleDragModeOnDblclick={false}
            />
          </div>

          <div className="px-5 py-4 space-y-4 border-t border-slate-800">
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

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium w-16 flex-shrink-0">Zoom</span>
              <button onClick={() => { const z = Math.max(0.1, zoomLevel - 0.1); setZoomLevel(z); cropperRef.current?.cropper?.zoomTo(z); }} className="p-1 text-slate-400 hover:text-white transition">
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.05}
                value={zoomLevel}
                onChange={handleZoom}
                className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
              />
              <button onClick={() => { const z = Math.min(3, zoomLevel + 0.1); setZoomLevel(z); cropperRef.current?.cropper?.zoomTo(z); }} className="p-1 text-slate-400 hover:text-white transition">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium w-16 flex-shrink-0">Rotate</span>
              <button onClick={() => { const r = rotationLevel - 15; setRotationLevel(r); cropperRef.current?.cropper?.rotateTo(r); }} className="p-1 text-slate-400 hover:text-white transition">
                <RotateCw className="w-4 h-4 scale-x-[-1]" />
              </button>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotationLevel}
                onChange={(e) => { const r = Number(e.target.value); setRotationLevel(r); cropperRef.current?.cropper?.rotateTo(r); }}
                className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
              />
              <button onClick={() => { const r = rotationLevel + 15; setRotationLevel(r); cropperRef.current?.cropper?.rotateTo(r); }} className="p-1 text-slate-400 hover:text-white transition">
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetAll}
                className="text-xs text-slate-500 hover:text-slate-300 transition underline underline-offset-2"
              >
                Reset all
              </button>
            </div>
          </div>

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
    </AnimatePresence>
  );
}
