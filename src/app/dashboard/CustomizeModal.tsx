"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Loader2, Send,
  CheckCircle2, Copy, ExternalLink, Image as ImageIcon, Music,
  AlertCircle, MessageCircle, Smartphone, Edit3, SlidersHorizontal,
} from "lucide-react";
import { getTemplateClass, TemplateClass, TemplateField } from "./templateConfig";
import { demos } from "./demoConfig";
import {
  createInstantEventFromTemplate,
  uploadMedia,
  getEventCustomData,
  updatePublishedEvent,
  checkPaymentAccess,
} from "./builder/actions";
import { useRouter } from "next/navigation";
import CanvasConfetti from "@/components/ui/CanvasConfetti";
import LivePhonePreview from "@/components/ui/LivePhonePreview";
import AutoClickSimulatedPreview from "@/components/ui/AutoClickSimulatedPreview";
import CheckoutModal from "./CheckoutModal";
import { compressImage } from "@/lib/clientImageCompressor";
import ImageCropModal from "@/components/ImageCropModal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CustomizeModalProps = {
  /** demoId of the template (class id) */
  demoId: string;
  /** If editing an already-saved event, pass its id */
  editEventId?: string;
  /** The slug of the event being edited (for showing the share URL) */
  editSlug?: string;
  isPremiumUser?: boolean;
  themePricing?: Array<{
    name: string;
    price: number;
    durationDays: number;
    isActive: boolean;
    title?: string | null;
    description?: string | null;
    thumbnailUrl?: string | null;
  }>;
  onClose: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function initFormValues(tmpl: TemplateClass, prefill: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const step of tmpl.steps) {
    for (const field of step.fields) {
      out[field.key] =
        prefill[field.key] ??
        (field.key === "_photo" ? (prefill["photoUrl"] ?? prefill["_photo1"]) : undefined) ??
        (field.key === "_audio" ? prefill["audioUrl"] : undefined) ??
        tmpl.defaultData[field.key] ??
        "";
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// FieldInput — renders a single form field
// ─────────────────────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  onFileChange,
  fileStatus,
  isLoading,
}: {
  field: TemplateField;
  value?: string;
  onChange?: (val: string) => void;
  onFileChange?: (file: File, fieldKey: string) => void;
  fileStatus?: "idle" | "uploading" | "done";
  isLoading?: boolean;
}) {
  const baseInput =
    "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition";

  if (field.type === "text") {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {field.label} {field.required && <span className="text-rose-500">*</span>}
        </label>
        <input
          type="text"
          required={field.required}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.placeholder}
          className={baseInput}
        />
        {field.hint && <p className="text-[11px] text-slate-400 mt-1">{field.hint}</p>}
        {field.presetSuggestions && field.presetSuggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            {field.presetSuggestions.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange?.(preset)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-700 font-medium transition"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {field.label} {field.required && <span className="text-rose-500">*</span>}
        </label>
        <textarea
          required={field.required}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${baseInput} resize-none`}
        />
        {field.hint && <p className="text-[11px] text-slate-400 mt-1">{field.hint}</p>}
        {field.presetSuggestions && field.presetSuggestions.length > 0 && (
          <div className="mt-2 space-y-1">
            {field.presetSuggestions.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange?.(preset)}
                className="w-full text-left text-[11px] p-2 rounded-lg bg-rose-50/70 hover:bg-rose-100 border border-rose-200/60 text-rose-800 font-medium transition line-clamp-2"
              >
                "{preset}"
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (field.type === "file-image" || field.type === "file-audio") {
    const isImage = field.type === "file-image";
    const Icon = isImage ? ImageIcon : Music;
    const hasValue = Boolean(value && typeof value === "string" && value.trim() && value !== "undefined");
    const isDone = fileStatus === "done" || hasValue;

    const statusText =
      fileStatus === "uploading"
        ? "Uploading…"
        : isDone
          ? isImage
            ? "✓ Photo Uploaded"
            : "✓ Audio Attached"
          : isImage
            ? "Choose Photo"
            : "Choose Audio";

    const statusColor =
      isDone
        ? "text-emerald-600 font-bold"
        : fileStatus === "uploading"
          ? "text-amber-600"
          : isImage
            ? "text-rose-600"
            : "text-slate-600";

    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {field.label}
        </label>

        <div className="flex items-center gap-2.5">
          {/* If image and hasValue, show thumbnail preview! */}
          {isImage && hasValue && (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-300 shadow-sm shrink-0 bg-slate-900">
              <img src={value} alt="Uploaded thumbnail" className="w-full h-full object-cover" />
            </div>
          )}

          <label
            className={`relative flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition ${
              isDone
                ? "border-emerald-300 bg-emerald-50/70 hover:bg-emerald-50"
                : isImage
                  ? "border-rose-200 bg-rose-50/50 hover:border-rose-400 hover:bg-rose-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
            } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {fileStatus === "uploading" ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-500 flex-shrink-0" />
            ) : (
              <Icon className={`w-5 h-5 flex-shrink-0 ${isDone ? "text-emerald-600" : isImage ? "text-rose-500" : "text-slate-500"}`} />
            )}
            <div className="flex-1 min-w-0">
              <span className={`text-xs sm:text-sm block truncate ${statusColor}`}>{statusText}</span>
              {hasValue && (
                <span className="text-[10px] text-slate-400 font-normal block">Tap to replace</span>
              )}
            </div>

            <input
              type="file"
              accept={field.accept}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileChange?.(file, field.key);
              }}
            />
          </label>

          {/* Remove / Reset button if custom file was selected */}
          {hasValue && (
            <button
              type="button"
              onClick={() => onChange?.("")}
              title="Remove and use default"
              className="px-2.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {field.hint && <p className="text-[11px] text-slate-400">{field.hint}</p>}
      </div>
    );
  }

  return null;
}

async function generateTextArtBlob(input: File | string, phrase?: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    let objectUrl: string | null = null;
    if (typeof input === "string") {
      img.src = input;
    } else {
      objectUrl = URL.createObjectURL(input);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      const W = 1080;
      const H = 1080;

      // ── Step 1: Draw image to temp canvas & apply exact grayscale + contrast + brightness filter ──
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = W;
      tmpCanvas.height = H;
      const tmpCtx = tmpCanvas.getContext("2d");
      if (!tmpCtx) return resolve(null);

      // Cover-crop photo to 1080x1080
      const imgRatio = img.width / img.height;
      let drawW = img.width, drawH = img.height, offsetX = 0, offsetY = 0;
      if (imgRatio > 1) {
        drawW = img.height;
        offsetX = (img.width - drawW) / 2;
      } else {
        drawH = img.width;
        offsetY = (img.height - drawH) / 2;
      }
      tmpCtx.drawImage(img, offsetX, offsetY, drawW, drawH, 0, 0, W, H);

      // Apply Grayscale (100%) + Contrast (160%) + Brightness (1.2)
      const imageData = tmpCtx.getImageData(0, 0, W, H);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        let gray = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        gray = ((gray - 128) * 1.6 + 128) * 1.2;
        gray = Math.min(255, Math.max(0, gray));
        d[i] = d[i + 1] = d[i + 2] = gray;
      }
      tmpCtx.putImageData(imageData, 0, 0);

      // ── Step 2: Draw dense white phrase text grid on black background ──
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#ffffff";
      const fontSize = 9;
      const lineHeight = 9;
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.textBaseline = "top";

      const targetPhrase = (phrase && phrase.trim()) ? phrase.trim() : "love you";
      const repPhrase = targetPhrase.toUpperCase() + "  ";
      let lineText = "";
      while (ctx.measureText(lineText).width < W + 300) {
        lineText += repPhrase;
      }

      const totalLines = Math.ceil(H / lineHeight) + 2;
      for (let y = 0; y < totalLines; y++) {
        ctx.fillText(lineText, 0, y * lineHeight);
      }

      // Step 3: Multiply blend grayscale photo on top of white text grid
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(tmpCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";

      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    };
    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CustomizeModal — main component
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomizeModal({ demoId, editEventId, editSlug, isPremiumUser, themePricing, onClose }: CustomizeModalProps) {
  const router = useRouter();
  const tmpl = getTemplateClass(demoId);

  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [fileStatuses, setFileStatuses] = useState<Record<string, "idle" | "uploading" | "done">>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // For editing: we need the eventId to upload files and update data
  const [activeEventId, setActiveEventId] = useState<string | null>(editEventId || null);
  const [activeEventSlug, setActiveEventSlug] = useState<string | null>(editSlug || null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isEventPaid, setIsEventPaid] = useState(false);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [cropTarget, setCropTarget] = useState<{
    file: File;
    fieldKey: string;
    objectUrl: string;
  } | null>(null);

  const demoItem = demos.find((d) => d.id === demoId);

  // Live admin pricing state (from props or auto-fetched from DB)
  const initialDbPricing = themePricing?.find((t) => t.name === demoId);
  const [liveThemePrice, setLiveThemePrice] = useState<number>(initialDbPricing?.price ?? demoItem?.price ?? 2100);
  const [liveThemeDuration, setLiveThemeDuration] = useState<number>(initialDbPricing?.durationDays ?? demoItem?.durationDays ?? 7);
  const [liveThemeTitle, setLiveThemeTitle] = useState<string>(initialDbPricing?.title ?? demoItem?.title ?? tmpl?.title ?? "Special Proposal");

  useEffect(() => {
    if (!demoId) return;
    fetch(`/api/theme/pricing?demoId=${encodeURIComponent(demoId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (typeof data.price === "number") setLiveThemePrice(data.price);
          if (typeof data.durationDays === "number") setLiveThemeDuration(data.durationDays);
          if (data.title) setLiveThemeTitle(data.title);
        }
      })
      .catch(() => {});
  }, [demoId]);

  // Pre-fill form when editing an existing event & check payment gate
  useEffect(() => {
    if (!tmpl) return;

    let isMounted = true;
    const checkAccess = async () => {
      setCheckingPayment(true);
      if (editEventId || isPremiumUser) {
        if (isMounted) {
          setNeedsPayment(false);
          setCheckingPayment(false);
        }
        return;
      }
      const hasPaid = await checkPaymentAccess(demoId);
      const requiresPayment = liveThemePrice > 0 && !hasPaid;
      if (isMounted) {
        setNeedsPayment(requiresPayment);
        setIsEventPaid(hasPaid);
        setCheckingPayment(false);
      }
    };

    checkAccess();

    if (editEventId) {
      setIsLoading(true);
      getEventCustomData(editEventId).then((res) => {
        if (res.success) {
          setFormValues(initFormValues(tmpl, res.customData));
          const statuses: Record<string, "idle" | "uploading" | "done"> = {};
          if (res.customData?._photo || res.customData?.photoUrl || res.customData?._photo1) statuses["_photo"] = "done";
          if (res.customData?._photo2) statuses["_photo2"] = "done";
          if (res.customData?._photo3) statuses["_photo3"] = "done";
          if (res.customData?._audio || res.customData?.audioUrl) statuses["_audio"] = "done";
          setFileStatuses(statuses);
        } else {
          setFormValues(initFormValues(tmpl, {}));
        }
        setIsLoading(false);
      });
    } else {
      // New event: pre-fill with class defaults so user sees defaults
      setFormValues(initFormValues(tmpl, {}));
    }

    return () => {
      isMounted = false;
    };
  }, [demoId, editEventId, isPremiumUser]); // eslint-disable-line

  // Dynamically re-generate the text-art blob whenever patternText or photo changes
  useEffect(() => {
    if (demoId !== "surprise" && !demoId.includes("surprise") && !demoId.includes("romantic")) return;

    const photoForBlob =
      formValues["_photo"] ||
      formValues["_photo1"] ||
      formValues["photoUrl"] ||
      tmpl?.defaultData?.["_photo"] ||
      tmpl?.defaultData?.["photo"];

    if (!photoForBlob) return;

    const timer = setTimeout(async () => {
      const dynamicPattern = (formValues["patternText"] && formValues["patternText"].trim())
        ? formValues["patternText"].trim()
        : "love you";

      try {
        const artBlob = await generateTextArtBlob(photoForBlob, dynamicPattern);
        if (artBlob) {
          const artFormData = new FormData();
          artFormData.append("file", artBlob, "surprise-art.jpg");
          const artRes = await fetch("/api/upload", { method: "POST", body: artFormData });
          const artData = await artRes.json();
          if (artData?.success && artData?.url) {
            setFormValues((prev) => ({ ...prev, generatedThumbnailUrl: artData.url }));
          }
        }
      } catch (e) {
        console.error("[ArtGen] Debounced re-generation failed in CustomizeModal:", e);
      }
    }, 750);

    return () => clearTimeout(timer);
  }, [formValues["patternText"], formValues["_photo"], formValues["_photo1"], formValues["photoUrl"], demoId]); // eslint-disable-line

  if (!tmpl) {
    return null; // unknown template
  }

  const totalSteps = tmpl.steps.length;
  const step = tmpl.steps[currentStep];

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const performFileUpload = async (file: File, fieldKey: string, isAudio: boolean) => {
    setFileStatuses((prev) => ({ ...prev, [fieldKey]: "uploading" }));
    setError(null);

    try {
      // Validate file size (max 4.5MB hard limit for Vercel Serverless request body)
      const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(
          isAudio
            ? `Audio file (${sizeMb} MB) exceeds the 4.5 MB server limit. Please select an MP3 under 4.5 MB or compress your audio file.`
            : `File (${sizeMb} MB) exceeds the 4.5 MB server limit. Please select a smaller file.`
        );
      }

      // Pre-compress images on client to ~80KB WebP
      let uploadFile = file;
      if (!isAudio && file.type.startsWith("image/")) {
        uploadFile = await compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.82 });
      }

      // 1. Try uploading to cloud storage via /api/upload endpoint
      const uploadFormData = new FormData();
      uploadFormData.append("file", uploadFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      // Guard against non-JSON responses from Vercel edge proxy (e.g. 413 Request Entity Too Large)
      if (res.status === 413) {
        throw new Error(`File is too large for the server (${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB). Vercel has a hard 4.5 MB limit.`);
      }

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Upload failed (server responded with code ${res.status}). Please ensure your file is under 4.5 MB.`);
      }

      if (data?.success && data?.url) {
        setFormValues((prev) => ({ ...prev, [fieldKey]: data.url }));

        // For surprise/romantic demo: generate and upload text-art thumbnail synchronously
        if (!isAudio && (demoId === "surprise" || fieldKey === "_photo" || fieldKey === "_photo1" || fieldKey === "photoUrl")) {
          setFormValues((prev) => ({ ...prev, generatedThumbnailUrl: data.url }));

          try {
            const customPatternText = (formValues["patternText"] && formValues["patternText"].trim())
              ? formValues["patternText"].trim()
              : "love you";
            const artBlob = await generateTextArtBlob(file, customPatternText);
            if (artBlob) {
              const artFormData = new FormData();
              artFormData.append("file", artBlob, "surprise-art.jpg");
              const artRes = await fetch("/api/upload", { method: "POST", body: artFormData });
              const artData = await artRes.json();
              if (artData?.success && artData?.url) {
                setFormValues((prev) => ({ ...prev, generatedThumbnailUrl: artData.url }));
              }
            }
          } catch (e) {
            console.error("[ArtGen] Generation/Upload failed in CustomizeModal:", e);
          }
        }

        setFileStatuses((prev) => ({ ...prev, [fieldKey]: "done" }));
        return;
      }

      // 2. Safe Fallback:
      // For images: The file is already compressed to ~80KB, so Base64 Data URL is completely safe
      // and will never trigger a 413 Payload Too Large error.
      if (!isAudio) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read image file."));
          reader.readAsDataURL(uploadFile);
        });

        setFormValues((prev) => ({ ...prev, [fieldKey]: dataUrl }));
        setFileStatuses((prev) => ({ ...prev, [fieldKey]: "done" }));
        return;
      }

      // For audio: Do NOT fallback to multi-MB Base64 which crashes Server Actions with 413.
      throw new Error(data?.message || "Failed to upload audio to cloud storage.");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "File upload failed.");
      setFileStatuses((prev) => ({ ...prev, [fieldKey]: "idle" }));
    }
  };

  const handleFileChange = async (file: File, fieldKey: string) => {
    const isAudio = file.type.startsWith("audio/") || fieldKey.toLowerCase().includes("audio");

    // For images: Open the interactive crop modal immediately so user can crop before upload!
    if (!isAudio && file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setCropTarget({ file, fieldKey, objectUrl });
      return;
    }

    // For audio and other files, proceed directly
    await performFileUpload(file, fieldKey, isAudio);
  };

  const handleSubmit = async () => {
    if (needsPayment && !isEventPaid) {
      setShowCheckoutModal(true);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // Build the overrides — merge class defaults with user's form values (including custom photo & audio)
      const overrides: Record<string, any> = {};
      for (const step of tmpl.steps) {
        for (const field of step.fields) {
          const val = formValues[field.key];
          if (val !== undefined && val !== "") {
            overrides[field.key] = val;
            if (field.key === "_photo" || field.key === "_photo1") overrides["photoUrl"] = val;
            if (field.key === "_audio") overrides["audioUrl"] = val;
          }
        }
      }
      // Dynamic text-art blob generation: user's input from the Portrait Background Text input, or "love you" only if empty
      if (demoId === "surprise" || demoId.includes("surprise") || demoId.includes("romantic")) {
        const dynamicPattern = (formValues["patternText"] && formValues["patternText"].trim())
          ? formValues["patternText"].trim()
          : "love you";
        overrides["patternText"] = formValues["patternText"] !== undefined ? formValues["patternText"] : "love you";

        const photoForBlob =
          formValues["_photo"] ||
          formValues["_photo1"] ||
          formValues["photoUrl"] ||
          tmpl?.defaultData?.["_photo"] ||
          tmpl?.defaultData?.["photo"] ||
          "/demos/surprise/cute_woman.png";

        if (photoForBlob) {
          try {
            const artBlob = await generateTextArtBlob(photoForBlob, dynamicPattern);
            if (artBlob) {
              const artFormData = new FormData();
              artFormData.append("file", artBlob, "surprise-art.jpg");
              const artRes = await fetch("/api/upload", { method: "POST", body: artFormData });
              const artData = await artRes.json();
              if (artData?.success && artData?.url) {
                overrides["generatedThumbnailUrl"] = artData.url;
                setFormValues((prev) => ({ ...prev, generatedThumbnailUrl: artData.url }));
              }
            }
          } catch (e) {
            console.error("[ArtGen] Generation on submit failed in CustomizeModal:", e);
          }
        }
      } else if (formValues["generatedThumbnailUrl"]) {
        overrides["generatedThumbnailUrl"] = formValues["generatedThumbnailUrl"];
      }

      if (editEventId && activeEventId) {
        // Re-editing a saved event — merge overrides into existing data
        const res = await updatePublishedEvent(activeEventId, overrides);
        if (!res.success) throw new Error(res.error || "Failed to update event.");
        // Show success with existing event URL
        const slug = activeEventSlug || editSlug;
        if (slug) {
          setPublishedUrl(`${window.location.origin}/p/${slug}`);
        } else {
          // Fallback: just close and refresh
          router.refresh();
          onClose();
        }
      } else if (activeEventId && activeEventSlug) {
        // We pre-created an event during file upload — update it with the text overrides
        const res = await updatePublishedEvent(activeEventId, {
          ...tmpl.defaultData,
          ...overrides,
          demoId,
        });
        if (!res.success) throw new Error(res.error || "Failed to update event.");
        setPublishedUrl(`${window.location.origin}/p/${activeEventSlug}`);
        router.refresh();
      } else {
        // No files were uploaded — create event fresh with overrides merged on top of class defaults
        const res = await createInstantEventFromTemplate(
          "Romantic",
          overrides["title"] || tmpl.defaultData.title,
          overrides["recipientName"] || "Someone Special ✨",
          demoId,
          overrides
        );
        if (!res.success || !res.eventId) throw new Error("Failed to save event.");
        setPublishedUrl(`${window.location.origin}${res.customUrl}`);
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  const copyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Published state with Animated Auto-Click Simulation ──
  if (publishedUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
        <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-rose-100 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition z-30"
          >
            <X className="w-5 h-5" />
          </button>

          <AutoClickSimulatedPreview
            demoId={demoId}
            formValues={formValues}
            defaultData={tmpl.defaultData}
            publishedUrl={publishedUrl}
            isPaid={isEventPaid}
            isPremiumUser={isPremiumUser}
            onActivateOffer={(pricing) => {
              setShowCheckoutModal(true);
            }}
            onShareFreeLink={() => {
              const text = `Hey! I made a special surprise link for you... Tap here to open 💖\n${publishedUrl}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
            }}
          />

          {showCheckoutModal && (
            <CheckoutModal
              demoId={demoId}
              templateName={liveThemeTitle}
              originalPrice={liveThemePrice}
              durationDays={liveThemeDuration}
              isPremiumUser={isPremiumUser}
              onClose={() => setShowCheckoutModal(false)}
              onSuccess={() => {
                setShowCheckoutModal(false);
                setIsEventPaid(true);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Main modal ──
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-950/80 backdrop-blur-md w-screen h-[100dvh] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-5xl max-h-[95dvh] sm:max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-100 relative"
      >
        {/* Header */}
        <div className="shrink-0 bg-white rounded-t-3xl border-b border-slate-100 px-4 sm:px-6 pt-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600 flex-shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {editEventId ? "Edit Event" : "Customize & Save"} 💌
              </h3>
              <p className="text-xs text-slate-500">{tmpl.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Form Inputs */}
            <div className="lg:col-span-7 space-y-4">
              {/* Step Progress */}
              {totalSteps > 1 && (
                <div className="flex items-center gap-2 mb-2">
                  {tmpl.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div
                        className={`flex-1 h-1.5 rounded-full transition-all ${i <= currentStep ? "bg-rose-500" : "bg-slate-200"
                          }`}
                      />
                    </div>
                  ))}
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                    {currentStep + 1} / {totalSteps}
                  </span>
                </div>
              )}

              {/* Form Steps Body */}
              <div>
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
                  </div>
                )}

                {!isLoading && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Step header */}
                      <div className="mb-2">
                        <h4 className="font-bold text-slate-900">{step.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                      </div>

                      {/* Fields */}
                      {step.fields.map((field) => (
                        <FieldInput
                          key={field.key}
                          field={field}
                          value={formValues[field.key]}
                          onChange={(val) => handleFieldChange(field.key, val)}
                          onFileChange={handleFileChange}
                          fileStatus={fileStatuses[field.key] as any}
                          isLoading={isLoading || isSubmitting}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl p-3.5 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Live Phone Preview (Always Visible On All Screen Sizes) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100 w-full sticky top-20">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose-500" /> Live Recipient View
                </p>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  Updates Live ✨
                </span>
              </div>
              <LivePhonePreview
                demoId={demoId}
                formValues={formValues}
                defaultData={tmpl.defaultData}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-white border-t border-slate-100 px-4 sm:px-6 py-4 flex items-center gap-3 sm:rounded-b-3xl">
          {/* Back */}
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={isLoading || isSubmitting}
              className="py-3 sm:py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-3 sm:py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              Cancel
            </button>
          )}

          {/* Next / Save */}
          {currentStep < totalSteps - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={isLoading || isSubmitting}
              className="flex-1 py-3 sm:py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting}
              className="flex-1 py-3 sm:py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition shadow-md shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> {editEventId ? "Update Event" : "Save & Generate Link"}
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {showCheckoutModal && demoItem && (
        <CheckoutModal
          demoId={demoId}
          templateName={liveThemeTitle}
          originalPrice={liveThemePrice}
          durationDays={liveThemeDuration}
          isPremiumUser={isPremiumUser}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            setShowCheckoutModal(false);
            setIsEventPaid(true);
            setNeedsPayment(false);
            handleSubmit();
          }}
        />
      )}

      {cropTarget && (
        <ImageCropModal
          imageSrc={cropTarget.objectUrl}
          originalFileName={cropTarget.file.name}
          initialAspect={1}
          onCancel={() => {
            URL.revokeObjectURL(cropTarget.objectUrl);
            setCropTarget(null);
          }}
          onComplete={async (_blob, croppedFile) => {
            const { fieldKey, objectUrl } = cropTarget;
            URL.revokeObjectURL(objectUrl);
            setCropTarget(null);
            await performFileUpload(croppedFile, fieldKey, false);
          }}
        />
      )}
    </div>
  );
}
