"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, ChevronRight, ChevronLeft, Loader2, Send,
  CheckCircle2, Copy, ExternalLink, Image as ImageIcon, Music,
  AlertCircle, MessageCircle, Smartphone, Edit3,
} from "lucide-react";
import { getTemplateClass, TemplateClass, TemplateField } from "./templateConfig";
import {
  createInstantEventFromTemplate,
  uploadMedia,
  getEventCustomData,
  updatePublishedEvent,
} from "./builder/actions";
import { useRouter } from "next/navigation";
import CanvasConfetti from "@/components/ui/CanvasConfetti";
import LivePhonePreview from "@/components/ui/LivePhonePreview";
import AutoClickSimulatedPreview from "@/components/ui/AutoClickSimulatedPreview";
import CheckoutModal from "./CheckoutModal";

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
  onClose: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function initFormValues(tmpl: TemplateClass, prefill: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const step of tmpl.steps) {
    for (const field of step.fields) {
      out[field.key] = prefill[field.key] ?? prefill[field.key === "_photo" ? "photoUrl" : field.key === "_audio" ? "audioUrl" : field.key] ?? tmpl.defaultData[field.key] ?? "";
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
    const statusText =
      fileStatus === "uploading"
        ? "Uploading…"
        : fileStatus === "done"
          ? "✓ Uploaded!"
          : isImage
            ? "Choose Photo"
            : "Choose Audio";
    const statusColor =
      fileStatus === "done"
        ? "text-emerald-600 font-bold"
        : fileStatus === "uploading"
          ? "text-amber-600"
          : isImage
            ? "text-rose-600"
            : "text-slate-600";

    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {field.label}
        </label>
        <label
          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition ${fileStatus === "done"
            ? "border-emerald-300 bg-emerald-50"
            : isImage
              ? "border-rose-200 bg-rose-50/50 hover:border-rose-400 hover:bg-rose-50"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
            } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        >
          {fileStatus === "uploading" ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-500 flex-shrink-0" />
          ) : (
            <Icon className={`w-5 h-5 flex-shrink-0 ${isImage ? "text-rose-500" : "text-slate-500"}`} />
          )}
          <span className={`text-sm ${statusColor}`}>{statusText}</span>
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
        {field.hint && <p className="text-[11px] text-slate-400 mt-1">{field.hint}</p>}
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CustomizeModal — main component
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomizeModal({ demoId, editEventId, editSlug, isPremiumUser, onClose }: CustomizeModalProps) {
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

  // Pre-fill form when editing an existing event
  useEffect(() => {
    if (!tmpl) return;
    if (editEventId) {
      setIsLoading(true);
      getEventCustomData(editEventId).then((res) => {
        if (res.success) {
          setFormValues(initFormValues(tmpl, res.customData));
        } else {
          setFormValues(initFormValues(tmpl, {}));
        }
        setIsLoading(false);
      });
    } else {
      // New event: pre-fill with class defaults so user sees defaults
      setFormValues(initFormValues(tmpl, {}));
    }
  }, [demoId, editEventId]); // eslint-disable-line

  if (!tmpl) {
    return null; // unknown template
  }

  const totalSteps = tmpl.steps.length;
  const step = tmpl.steps[currentStep];

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (file: File, fieldKey: string) => {
    setFileStatuses((prev) => ({ ...prev, [fieldKey]: "uploading" }));
    setError(null);

    try {
      // 1. Try uploading to /api/upload endpoint first (saves clean file to /uploads/ directory)
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormValues((prev) => ({ ...prev, [fieldKey]: data.url }));
        setFileStatuses((prev) => ({ ...prev, [fieldKey]: "done" }));
        return;
      }

      // 2. Fallback to client-side Data URL if API upload fails
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read audio/image file."));
        reader.readAsDataURL(file);
      });

      setFormValues((prev) => ({ ...prev, [fieldKey]: dataUrl }));
      setFileStatuses((prev) => ({ ...prev, [fieldKey]: "done" }));
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "File upload failed.");
      setFileStatuses((prev) => ({ ...prev, [fieldKey]: "idle" }));
    }
  };

  const handleSubmit = async () => {
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
              templateName={tmpl.title || "Custom Proposal"}
              originalPrice={19900}
              durationDays={3650}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-rose-100 relative"
      >
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white rounded-t-3xl border-b border-slate-100 px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600 flex-shrink-0">
              <Sparkles className="w-5 h-5 fill-rose-500" />
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

        <div className="p-4 sm:p-6">
          {/* Mobile Segmented Tab Control */}
          <div className="flex md:hidden p-1 bg-slate-100 rounded-2xl mb-4 text-xs font-bold border border-slate-200/60">
            <button
              type="button"
              onClick={() => setMobileTab("edit")}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${mobileTab === "edit"
                ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-rose-500" /> Edit Details
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${mobileTab === "preview"
                ? "bg-white text-rose-600 shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-500" /> Live Preview ✨
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Form Inputs */}
            <div className={`${mobileTab === "edit" ? "block" : "hidden"} md:block md:col-span-7 space-y-4`}>
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

            {/* Right Column: Interactive Live Phone Preview */}
            <div className={`${mobileTab === "preview" ? "flex" : "hidden"} md:flex md:col-span-5 flex-col items-center justify-center bg-slate-50 rounded-2xl p-3 py-4 border border-slate-100 self-center w-full`}>
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose-500" /> Live Recipient View
                </p>
                <button
                  type="button"
                  onClick={() => setMobileTab("edit")}
                  className="md:hidden text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl border border-rose-200 transition"
                >
                  ✍️ Back to Form
                </button>
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
        <div className="sticky bottom-0 z-40 bg-white border-t border-slate-100 px-6 py-4 flex items-center gap-3 rounded-b-3xl">
          {/* Back */}
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={isLoading || isSubmitting}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              Cancel
            </button>
          )}

          {/* Next / Save */}
          {currentStep < totalSteps - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={isLoading || isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition shadow-md shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-70"
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
    </div>
  );
}
