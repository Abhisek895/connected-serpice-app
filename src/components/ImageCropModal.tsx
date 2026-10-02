"use client";

import { useState, useRef, useEffect } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ZoomIn, ZoomOut, RotateCw, Crop, Heart, RefreshCw } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string;
  originalFileName?: string;
  initialAspect?: number;
  onCancel: () => void;
  onComplete: (croppedBlob: Blob, croppedFile: File) => void;
}

export default function ImageCropModal({
  imageSrc,
  originalFileName = "photo.jpg",
  initialAspect = -1,
  onCancel,
  onComplete,
}: ImageCropModalProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspect, setAspect] = useState<number>(initialAspect);
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
        const cleanName = originalFileName.replace(/\.[^/.]+$/, "") + ".jpg";
        const file = new File([blob], cleanName, { type: "image/jpeg" });
        onComplete(blob, file);
      }
      setIsProcessing(false);
    }, 'image/jpeg', 0.90);
  };

  const aspectOptions = [
    { label: "Original", value: -1, desc: "Full Image" },
    { label: "1:1 Square", value: 1, desc: "Polaroids & Cards" },
    { label: "4:5 Portrait", value: 4 / 5, desc: "Photos" },
    { label: "16:9 Banner", value: 16 / 9, desc: "Landscape" },
    { label: "Freeform", value: 0, desc: "Custom" },
  ];

  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    
    if (aspect === -1) {
      const imageData = cropper.getImageData();
      cropper.setAspectRatio(imageData.naturalWidth / imageData.naturalHeight);
    } else if (aspect === 0) {
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
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
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative w-full bg-black/95 flex-1 min-h-[280px] sm:min-h-[340px]">
            <Cropper
              src={imageSrc}
              style={{ height: '100%', width: '100%', minHeight: '280px' }}
              initialAspectRatio={initialAspect === -1 ? NaN : (initialAspect === 0 ? NaN : initialAspect)}
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
              ready={() => {
                 const cropper = cropperRef.current?.cropper;
                 if(cropper && initialAspect === -1) {
                    const imageData = cropper.getImageData();
                    cropper.setAspectRatio(imageData.naturalWidth / imageData.naturalHeight);
                 }
              }}
            />
          </div>

          <div className="px-5 py-4 space-y-3.5 border-t border-slate-800 bg-slate-900/90">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aspect:</span>
              <div className="flex gap-1.5 flex-1 justify-end">
                {aspectOptions.map((opt) => (
                  <button
                    key={opt.label}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-2 rounded-xl">
                <button
                  onClick={() => { const z = Math.max(0.1, zoomLevel - 0.1); setZoomLevel(z); cropperRef.current?.cropper?.zoomTo(z); }}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={0.1}
                  max={3}
                  step={0.05}
                  value={zoomLevel}
                  onChange={handleZoom}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg accent-rose-500 cursor-pointer"
                />
                <button
                  onClick={() => { const z = Math.min(3, zoomLevel + 0.1); setZoomLevel(z); cropperRef.current?.cropper?.zoomTo(z); }}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-2 rounded-xl justify-between">
                <button
                  onClick={() => { const r = rotationLevel + 90; setRotationLevel(r); cropperRef.current?.cropper?.rotateTo(r); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-rose-400 transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  onClick={resetAll}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/60">
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Drag corners to resize or drag image to position
            </p>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
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
